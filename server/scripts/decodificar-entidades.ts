/**
 * Migración única: la versión PHP guardaba textos con htmlspecialchars()
 * (por ejemplo "O&#039;Higgins"). React escapa al mostrar, así que esos textos
 * se verían con las entidades. Este script los devuelve a texto normal.
 *
 * Uso (desde la carpeta server):  npm run decodificar-entidades
 */
import { all, exec, pool } from '../src/db.js';

const TABLAS: Record<string, string[]> = {
  usuario: ['rut', 'nombre', 'correo', 'telefono', 'direccion'],
  productos: ['nombre', 'descripcion', 'marca', 'color', 'codigo_barras'],
  categorias: ['nombre'],
  familias: ['nombre'],
};

const ENTIDADES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'", '&apos;': "'" };

function decodificar(texto: string): string {
  return texto
    .replace(/&#(\d+);/g, (m, code) => (m in ENTIDADES ? ENTIDADES[m] : String.fromCodePoint(Number(code))))
    .replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENTIDADES[m]);
}

let total = 0;
for (const [tabla, columnas] of Object.entries(TABLAS)) {
  const filas = await all(`SELECT id, ${columnas.join(', ')} FROM \`${tabla}\``);
  for (const fila of filas) {
    const cambios: Record<string, string> = {};
    for (const columna of columnas) {
      const valor = fila[columna];
      if (typeof valor === 'string' && valor.includes('&')) {
        const nuevo = decodificar(valor);
        if (nuevo !== valor) cambios[columna] = nuevo;
      }
    }
    if (!Object.keys(cambios).length) continue;

    const set = Object.keys(cambios).map((c) => `\`${c}\` = ?`).join(', ');
    await exec(`UPDATE \`${tabla}\` SET ${set} WHERE id = ?`, [...Object.values(cambios), fila.id]);
    total++;
    console.log(`${tabla} #${fila.id}: ${Object.keys(cambios).join(', ')}`);
  }
}

console.log(`Listo. Filas actualizadas: ${total}`);
await pool.end();
