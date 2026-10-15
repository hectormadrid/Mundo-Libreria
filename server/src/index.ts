import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

const app = createApp();

// No aceptar peticiones hasta que la tabla de sesiones esté lista.
await app.locals.sessionStore.onReady();

const server = app.listen(config.port, () => {
  console.log(`Mundo Librería escuchando en http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    void Promise.all([app.locals.sessionStore.close(), pool.end()]).finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
