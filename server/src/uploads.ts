import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { uploadsDir } from './config.js';
import { HttpError } from './http.js';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Recibe la imagen en memoria (máx. 2MB) para validarla antes de guardarla. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
}).single('imagen');

/** Tipo real del archivo según sus primeros bytes; no se confía en la extensión ni en el MIME enviado. */
function detectImageType(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/** Guarda la imagen y devuelve el nombre de archivo. */
export async function storeProductImage(file: Express.Multer.File): Promise<string> {
  const extension = detectImageType(file.buffer);
  if (!extension) {
    throw HttpError.badRequest('Tipo de archivo no permitido. Usa JPG, PNG o WEBP.');
  }
  const name = `producto_${Math.floor(Date.now() / 1000)}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
  await fs.mkdir(uploadsDir(), { recursive: true });
  await fs.writeFile(path.join(uploadsDir(), name), file.buffer);
  return name;
}

export async function deleteProductImage(name: string | null | undefined): Promise<void> {
  if (!name || path.basename(name) !== name) return;
  await fs.rm(path.join(uploadsDir(), name), { force: true });
}
