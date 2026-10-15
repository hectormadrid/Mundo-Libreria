import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';
import { usesSupabaseStorage } from './uploads.js';

// Comprobar la conexión antes de aceptar visitas, para fallar con un mensaje claro.
try {
  await pool.query('select 1');
} catch (error) {
  console.error('No se pudo conectar a la base de datos. Revisa DATABASE_URL en el archivo .env.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`Mundo Librería escuchando en http://localhost:${config.port}`);
  if (!usesSupabaseStorage()) {
    console.warn('Aviso: SUPABASE_URL / SUPABASE_SECRET_KEY no definidos; las imágenes se guardan en public/uploads.');
  }
});

function shutdown() {
  server.close(() => {
    app.locals.sessionStore.close();
    void pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
