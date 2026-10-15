import crypto from 'node:crypto';
import { Router, type Request } from 'express';
import { exec, one } from '../db.js';
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
    user = await one('SELECT id, nombre, correo FROM clientes WHERE id = $1', [uid]);
    if (!user) delete req.session.userId;
  }

  let admin = null;
  const aid = adminId(req);
  if (aid !== null) {
    admin = await one('SELECT id, usuario AS nombre FROM administradores WHERE id = $1', [aid]);
    if (!admin) delete req.session.adminId;
  }

  return { user, admin, csrfToken: csrfToken(req) };
}

/** URL pública del frontend: APP_URL o, si no existe, la de la petición. */
function frontendUrl(req: Request, path: string): string {
  const base = config.appUrl || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/+$/, '')}/${path}`;
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

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
  const cliente = await one('SELECT id, password_hash FROM clientes WHERE lower(correo) = lower($1)', [correo]);
  if (!cliente || !(await verifyPassword(password, cliente.password_hash))) {
    registerFailure(req, 'user', correo);
    throw HttpError.unauthorized('Credenciales incorrectas.');
  }

  clearThrottle(req, 'user', correo);
  await loginUser(req, cliente.id);
  send(res, await sessionPayload(req));
});

authRouter.post('/auth/register', async (req, res) => {
  const rut = str(req, 'rut');
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = str(req, 'telefono');
  const password = rawString(req, 'password');

  if (!rut || !nombre || !correo || !telefono || !password) throw HttpError.badRequest('Completa todos los campos.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato de correo no es válido.');
  if (!isRut(rut)) throw HttpError.badRequest('El formato de RUT no es válido.');
  if (!isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);
  if (await one('SELECT id FROM clientes WHERE lower(correo) = lower($1) OR rut = $2', [correo, rut])) {
    throw HttpError.conflict('El correo o el RUT ya están registrados.');
  }

  await exec('INSERT INTO clientes (rut, nombre, correo, telefono, password_hash) VALUES ($1, $2, $3, $4, $5)', [
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
  const admin = await one('SELECT id, password_hash FROM administradores WHERE lower(usuario) = lower($1)', [nombre]);
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
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
  const cliente = await one('SELECT id, correo FROM clientes WHERE lower(correo) = lower($1)', [correo]);

  if (cliente) {
    const token = crypto.randomBytes(32).toString('hex');
    await exec("UPDATE clientes SET reset_token_hash = $1, reset_token_expira = now() + interval '1 hour' WHERE id = $2", [
      sha256(token),
      cliente.id,
    ]);
    await sendMail(cliente.correo, 'Recuperación de Contraseña - Mundo Librería', passwordResetTemplate(frontendUrl(req, `restablecer?token=${token}`)));
  }

  send(res, { message });
});

async function findClientByResetToken(token: string) {
  if (!token) throw HttpError.badRequest('No se proporcionó un token de recuperación.');
  const cliente = await one('SELECT id, reset_token_expira < now() AS expirado FROM clientes WHERE reset_token_hash = $1', [sha256(token)]);
  if (!cliente) throw HttpError.badRequest('El enlace de recuperación no es válido o ya fue utilizado.');
  if (cliente.expirado) throw HttpError.badRequest('El enlace de recuperación expiró. Solicita uno nuevo.');
  return cliente;
}

authRouter.post('/auth/reset-password/validate', async (req, res) => {
  await findClientByResetToken(str(req, 'token'));
  send(res, { valid: true });
});

authRouter.post('/auth/reset-password', async (req, res) => {
  const cliente = await findClientByResetToken(str(req, 'token'));
  const password = rawString(req, 'password');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);

  await exec('UPDATE clientes SET password_hash = $1, reset_token_hash = NULL, reset_token_expira = NULL WHERE id = $2', [
    await hashPassword(password),
    cliente.id,
  ]);
  send(res, { message: '¡Tu contraseña ha sido actualizada con éxito!' });
});
