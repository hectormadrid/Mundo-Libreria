/**
 * Sube a Supabase Storage las imágenes de productos que están en public/uploads/productos
 * (las de la versión anterior). Solo sube las que algún producto usa y que aún no están
 * en el bucket. Se puede ejecutar varias veces sin duplicar nada.
 *
 * Requiere en .env: DATABASE_URL, SUPABASE_URL y SUPABASE_SECRET_KEY.
 * Uso (desde la carpeta server):  npm run subir-imagenes
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../src/config.js';
import { all, pool } from '../src/db.js';
import { saveImage, usesSupabaseStorage } from '../src/uploads.js';

if (!usesSupabaseStorage()) {
  console.error('Define SUPABASE_URL y SUPABASE_SECRET_KEY en el archivo .env antes de ejecutar este script.');
  process.exit(1);
}

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const localDir = path.join(config.publicDir, 'uploads', 'productos');

const productos = await all<{ id: number; nombre: string; imagen: string }>(
  'SELECT id, nombre, imagen FROM productos WHERE imagen IS NOT NULL ORDER BY id',
);

let subidas = 0;
const faltantes: string[] = [];

for (const p of productos) {
  const file = path.join(localDir, p.imagen);
  if (!fs.existsSync(file)) {
    faltantes.push(`#${p.id} ${p.nombre} (${p.imagen})`);
    continue;
  }
  try {
    await saveImage(p.imagen, fs.readFileSync(file), TYPES[path.extname(p.imagen).toLowerCase()] ?? 'application/octet-stream');
    subidas++;
    console.log(`Subida: ${p.imagen}`);
  } catch (error) {
    // Si ya existe en el bucket, Supabase responde con un error de duplicado: se omite.
    const message = error instanceof Error ? error.message : String(error);
    if (/exists|duplicate/i.test(message)) console.log(`Ya estaba en el bucket: ${p.imagen}`);
    else throw error;
  }
}

console.log(`\nListo: ${subidas} imágenes subidas.`);
if (faltantes.length) {
  console.log('Estos productos apuntan a imágenes que no existen en public/uploads/productos:');
  faltantes.forEach((f) => console.log(`  - ${f}`));
}
await pool.end();
