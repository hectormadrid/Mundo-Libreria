import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { HttpError } from './http.js';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Recibe la imagen en memoria (máx. 2MB) para validarla antes de guardarla. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
}).single('imagen');

const TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const;

/** Tipo real del archivo según sus primeros bytes; no se confía en la extensión ni en el MIME enviado. */
function detectImageType(buffer: Buffer): keyof typeof TYPES | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/**
 * Las imágenes se guardan en el bucket de Supabase Storage. Si SUPABASE_URL o
 * SUPABASE_SECRET_KEY no están definidos (desarrollo sin Supabase, pruebas), se usa
 * la carpeta public/uploads/productos.
 */
const supabase =
  config.supabase.url && config.supabase.secretKey
    ? createClient(config.supabase.url, config.supabase.secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

const localDir = () => path.join(config.publicDir, 'uploads', 'productos');

export function usesSupabaseStorage(): boolean {
  return supabase !== null;
}

/** URL pública de una imagen guardada (o null si el producto no tiene). */
export function imageUrl(name: string | null | undefined): string | null {
  if (!name) return null;
  const file = encodeURIComponent(name);
  return supabase ? `${config.supabase.url}/storage/v1/object/public/${config.supabase.bucket}/${file}` : `/uploads/productos/${file}`;
}

export async function saveImage(name: string, buffer: Buffer, contentType: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.storage.from(config.supabase.bucket).upload(name, buffer, { contentType, upsert: false });
    if (error) throw new Error(`No se pudo subir la imagen a Supabase Storage: ${error.message}`);
    return;
  }
  await fs.mkdir(localDir(), { recursive: true });
  await fs.writeFile(path.join(localDir(), name), buffer);
}

/** Valida y guarda la imagen subida; devuelve el nombre del archivo. */
export async function storeProductImage(file: Express.Multer.File): Promise<string> {
  const extension = detectImageType(file.buffer);
  if (!extension) {
    throw HttpError.badRequest('Tipo de archivo no permitido. Usa JPG, PNG o WEBP.');
  }
  const name = `producto_${Math.floor(Date.now() / 1000)}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
  await saveImage(name, file.buffer, TYPES[extension]);
  return name;
}

export async function deleteProductImage(name: string | null | undefined): Promise<void> {
  if (!name || path.basename(name) !== name) return;
  try {
    if (supabase) {
      const { error } = await supabase.storage.from(config.supabase.bucket).remove([name]);
      if (error) throw error;
    } else {
      await fs.rm(path.join(localDir(), name), { force: true });
    }
  } catch (error) {
    // Una imagen huérfana no debe hacer fallar la operación principal.
    console.error(`No se pudo eliminar la imagen ${name}:`, error);
  }
}
