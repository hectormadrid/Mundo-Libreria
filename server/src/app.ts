import fs from 'node:fs';
import path from 'node:path';
import express, { type ErrorRequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import multer from 'multer';
import { config } from './config.js';
import { isUniqueViolation, pool } from './db.js';
import { HttpError } from './http.js';
import { verifyCsrf } from './auth.js';
import { authRouter } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { cartRouter } from './routes/cart.js';
import { accountRouter } from './routes/account.js';
import { adminRouter } from './routes/admin.js';

const PgStore = connectPgSimple(session);

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    next();
  });

  // Las sesiones se guardan en la tabla `sesiones` (database/schema.sql) y sobreviven a reinicios.
  const sessionStore = new PgStore({ pool, tableName: 'sesiones', pruneSessionInterval: 15 * 60 });
  app.locals.sessionStore = sessionStore;

  // ------------------------------------------------------------------ API
  const api = express.Router();
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  api.use(express.json({ limit: '100kb' }));
  api.use(
    session({
      name: 'mundo_libreria_sid',
      secret: config.sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto', maxAge: 1000 * 60 * 60 * 24 * 7 },
    }),
  );
  api.use(verifyCsrf);
  api.use(authRouter, catalogRouter, cartRouter, accountRouter);
  api.use('/admin', adminRouter);
  api.use((_req, _res, next) => next(HttpError.notFound('Ruta no encontrada.')));

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
    } else if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el límite de 2MB.' : 'No se pudo procesar el archivo enviado.';
      res.status(400).json({ error: message });
    } else if (isUniqueViolation(error)) {
      res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
    } else if (error?.type === 'entity.parse.failed' || error?.type === 'entity.too.large') {
      res.status(400).json({ error: 'El cuerpo de la petición no es válido.' });
    } else {
      console.error('Error en la API:', error);
      res.status(500).json({ error: 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.' });
    }
  };
  api.use(errorHandler);
  app.use('/api', api);

  // ------------------------------------------------------- Archivos y React
  const publicDir = config.publicDir;
  app.use('/static', express.static(path.join(publicDir, 'static'), { immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(publicDir, { index: false, maxAge: '1h' }));

  // Cualquier otra ruta (/producto/5, /admin/pedidos...) la resuelve React.
  const indexHtml = path.join(publicDir, 'index.html');
  app.get('/{*path}', (_req, res) => {
    if (!fs.existsSync(indexHtml)) {
      res.status(503).type('text').send('Falta compilar el frontend: ejecuta "npm run build" en la carpeta frontend.');
      return;
    }
    res.set('Cache-Control', 'no-cache').sendFile(indexHtml);
  });

  return app;
}
