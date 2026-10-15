import crypto from 'node:crypto';
import { Router, type Request } from 'express';
import { exec, insert, one } from '../db.js';
import { HttpError, rawString, send, str } from '../http.js';
import { adminId, csrfToken, hashPassword, loginAdmin, loginUser, regenerateSession, userId, verifyPassword } from '../auth.js';
import { checkThrottle, clearThrottle, registerFailure } from '../throttle.js';
import { isEmail, isPhone, isRut, isStrongPassword, PASSWORD_RULE } from '../validation.js';
import { passwordResetTemplate, sendMail, welcomeTemplate } from '../mail.js';
import { config } from '../config.js';

export const authRouter = Router();

/** Estado de la sesión actual y token CSRF para las siguientes peticiones. */
async function sessionPayload(req: Request) {
  let user = null;
  const uid = userId(req);
  if (uid !== null) {
    user = await one('SELECT id, nombre, correo FROM usuario WHERE id = ?', [uid]);
    if (!user) delete req.session.userId;
  }

  let admin = null;
  const aid = adminId(req);
  if (aid !== null) {
    admin = await one('SELECT id, nombre FROM Administrador WHERE id = ?', [aid]);
    if (!admin) delete req.session.adminId;
  }

  return { user, admin, csrfToken: csrfToken(req) };
}

/** URL pública del frontend: APP_URL o, si no existe, la de la petición. */
function frontendUrl(req: Request, path: string): string {
  const base = config.appUrl || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/+$/, '')}/${path}`;
}

authRouter.get('/auth/session', async (req, res) => {
  send(res, await sessionPayload(req));
});

authRouter.post('/auth/login', async (req, res) => {
  const correo = str(req, 'correo');
  const password = rawString(req, 'password');
  if (!isEmail(correo) || password === '') {
    throw HttpError.badRequest('Ingresa un correo válido y tu contraseña.');
  }

  checkThrottle(req, 'user', correo);
  const usuario = await one('SELECT id, password FROM usuario WHERE correo = ? LIMIT 1', [correo]);
  if (!usuario || !(await verifyPassword(password, usuario.password))) {
    registerFailure(req, 'user', correo);
    throw HttpError.unauthorized('Credenciales incorrectas.');
  }

  clearThrottle(req, 'user', correo);
  await loginUser(req, usuario.id);
  send(res, await sessionPayload(req));
});

authRouter.post('/auth/register', async (req, res) => {
  const rut = str(req, 'rut');
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = str(req, 'telefono');
  const password = rawString(req, 'password');

  if (!rut || !nombre || !correo || !telefono || !password) throw HttpError.badRequest('Completa todos los campos.');
  if (nombre.length > 50) throw HttpError.badRequest('El nombre no puede superar los 50 caracteres.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato de correo no es válido.');
  if (!isRut(rut)) throw HttpError.badRequest('El formato de RUT no es válido.');
  if (!isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);
  if (await one('SELECT id FROM usuario WHERE correo = ? OR rut = ?', [correo, rut])) {
    throw HttpError.conflict('El correo o el RUT ya están registrados.');
  }

  await insert('INSERT INTO usuario (rut, nombre, correo, telefono, password) VALUES (?, ?, ?, ?, ?)', [
    rut,
    nombre,
    correo,
    telefono,
    await hashPassword(password),
  ]);

  sendMail(correo, '¡Bienvenido a Mundo Librería!', welcomeTemplate(nombre, frontendUrl(req, ''))).catch((error) =>
    console.error('Error al enviar correo de bienvenida:', error),
  );

  send(res, { message: '¡Registro exitoso! Ya puedes iniciar sesión.' }, 201);
});

authRouter.post('/auth/logout', async (req, res) => {
  await regenerateSession(req);
  send(res, { user: null, admin: null, csrfToken: csrfToken(req) });
});

authRouter.post('/admin/auth/login', async (req, res) => {
  const nombre = str(req, 'nombre');
  const password = rawString(req, 'password');
  if (!nombre || !password) throw HttpError.badRequest('Completa todos los campos.');

  checkThrottle(req, 'admin', nombre);
  const admin = await one('SELECT id, password FROM Administrador WHERE nombre = ? LIMIT 1', [nombre]);
  if (!admin || !(await verifyPassword(password, admin.password))) {
    registerFailure(req, 'admin', nombre);
    throw HttpError.unauthorized('Credenciales incorrectas.');
  }

  clearThrottle(req, 'admin', nombre);
  await loginAdmin(req, admin.id);
  send(res, await sessionPayload(req));
});

authRouter.post('/auth/forgot-password', async (req, res) => {
  const correo = str(req, 'correo');
  if (!isEmail(correo)) throw HttpError.badRequest('Ingresa una dirección de correo electrónico válida.');

  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  const message = 'Si tu correo está registrado, recibirás un enlace de recuperación en unos minutos.';
  const usuario = await one('SELECT id FROM usuario WHERE correo = ? LIMIT 1', [correo]);

  if (usuario) {
    const token = crypto.randomBytes(32).toString('hex');
    await exec('UPDATE usuario SET reset_token_hash = ?, reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [
      sha256(token),
      usuario.id,
    ]);
    await sendMail(correo, 'Recuperación de Contraseña - Mundo Librería', passwordResetTemplate(frontendUrl(req, `restablecer?token=${token}`)));
  }

  send(res, { message });
});

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

async function findUserByResetToken(token: string) {
  if (!token) throw HttpError.badRequest('No se proporcionó un token de recuperación.');
  const usuario = await one('SELECT id, reset_token_expires_at < NOW() AS expirado FROM usuario WHERE reset_token_hash = ? LIMIT 1', [sha256(token)]);
  if (!usuario) throw HttpError.badRequest('El enlace de recuperación no es válido o ya fue utilizado.');
  if (usuario.expirado) throw HttpError.badRequest('El enlace de recuperación expiró. Solicita uno nuevo.');
  return usuario;
}

authRouter.post('/auth/reset-password/validate', async (req, res) => {
  await findUserByResetToken(str(req, 'token'));
  send(res, { valid: true });
});

authRouter.post('/auth/reset-password', async (req, res) => {
  const usuario = await findUserByResetToken(str(req, 'token'));
  const password = rawString(req, 'password');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);

  await exec('UPDATE usuario SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?', [
    await hashPassword(password),
    usuario.id,
  ]);
  send(res, { message: '¡Tu contraseña ha sido actualizada con éxito!' });
});
