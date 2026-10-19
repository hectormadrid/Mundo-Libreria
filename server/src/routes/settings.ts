import { Router, type Request } from 'express';
import { one } from '../db.js';
import { HttpError, send } from '../http.js';

export const settingsRouter = Router();

export interface Horario {
  dia: string;
  horario: string;
}

export interface StoreSettings {
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  horarios: Horario[];
  datosTransferencia: string | null;
}

export async function getSettings(): Promise<StoreSettings> {
  const row = await one('SELECT * FROM configuracion_tienda WHERE id = 1');
  return {
    telefono: row?.telefono ?? null,
    correo: row?.correo ?? null,
    direccion: row?.direccion ?? null,
    whatsapp: row?.whatsapp ?? null,
    instagram: row?.instagram ?? null,
    facebook: row?.facebook ?? null,
    horarios: Array.isArray(row?.horarios) ? row.horarios : [],
    datosTransferencia: row?.datos_transferencia ?? null,
  };
}

/** Datos públicos de la tienda: contacto, redes, horarios y datos de transferencia. */
settingsRouter.get('/settings', async (_req, res) => {
  send(res, await getSettings());
});

const LIMITS: Record<string, number> = { telefono: 30, correo: 254, direccion: 255, whatsapp: 255, instagram: 255, facebook: 255, datosTransferencia: 1000 };

function optionalText(req: Request, key: string): string | null {
  const raw = (req.body ?? {})[key];
  if (raw !== null && raw !== undefined && typeof raw !== 'string') throw HttpError.badRequest(`El campo ${key} no es válido.`);
  const value = (raw ?? '').trim();
  if (value.length > LIMITS[key]) throw HttpError.badRequest(`El campo ${key} no puede superar los ${LIMITS[key]} caracteres.`);
  return value || null;
}

function optionalUrl(req: Request, key: string): string | null {
  const value = optionalText(req, key);
  if (value && !/^https:\/\/\S+$/i.test(value)) throw HttpError.badRequest(`El enlace de ${key} debe comenzar con https://`);
  return value;
}

/** Valida y guarda la configuración (lo usa el panel de administración). */
export async function updateSettings(req: Request): Promise<StoreSettings> {
  const horariosRaw = (req.body ?? {}).horarios;
  if (!Array.isArray(horariosRaw) || horariosRaw.length > 10) throw HttpError.badRequest('Los horarios no son válidos (máximo 10 filas).');
  const horarios: Horario[] = horariosRaw
    .map((h) => ({ dia: String(h?.dia ?? '').trim(), horario: String(h?.horario ?? '').trim() }))
    .filter((h) => h.dia || h.horario);
  if (horarios.some((h) => !h.dia || !h.horario || h.dia.length > 50 || h.horario.length > 50)) {
    throw HttpError.badRequest('Cada horario necesita un día y un horario (máximo 50 caracteres cada uno).');
  }

  const correo = optionalText(req, 'correo');
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw HttpError.badRequest('El correo de contacto no es válido.');

  await one(
    `UPDATE configuracion_tienda SET telefono = $1, correo = $2, direccion = $3, whatsapp = $4, instagram = $5,
            facebook = $6, horarios = $7, datos_transferencia = $8
     WHERE id = 1 RETURNING id`,
    [
      optionalText(req, 'telefono'),
      correo,
      optionalText(req, 'direccion'),
      optionalUrl(req, 'whatsapp'),
      optionalUrl(req, 'instagram'),
      optionalUrl(req, 'facebook'),
      JSON.stringify(horarios),
      optionalText(req, 'datosTransferencia'),
    ],
  );
  return getSettings();
}
