import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { config } from './config.js';

const escape = (value: unknown) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]!);

const money = (value: number) => '$' + Math.round(value).toLocaleString('es-CL');

const transporter = config.smtp.user
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

/** Envía un correo. Sin SMTP configurado (desarrollo), lo escribe en el archivo de log. */
export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    await fs.mkdir(path.dirname(config.mailLogPath), { recursive: true });
    const entry = `========================================\nFECHA: ${new Date().toISOString()}\nPARA: ${to}\nASUNTO: ${subject}\nCONTENIDO:\n${html}\n========================================\n\n`;
    await fs.appendFile(config.mailLogPath, entry);
    return;
  }
  await transporter.sendMail({ from: { name: config.smtp.fromName, address: config.smtp.user }, to, subject, html });
}

const footer = (text: string) =>
  `<hr style='border: 0; border-top: 1px solid #eee;'><p style='font-size: 12px; color: #777; text-align: center;'>&copy; ${new Date().getFullYear()} Mundo Librería. ${text}</p>`;

export function welcomeTemplate(nombre: string, storeUrl: string): string {
  return `
  <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
    <div style='background: linear-gradient(135deg, #E53E3E 0%, #3182CE 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
      <h1 style='color: white; margin: 0;'>¡Bienvenido, ${escape(nombre)}!</h1>
    </div>
    <div style='padding: 20px; color: #333;'>
      <p>Estamos encantados de que te hayas unido a <b>Mundo Librería</b>.</p>
      <p>En nuestra tienda encontrarás todo lo que necesitas para tu oficina, estudio o proyectos creativos.</p>
      <div style='text-align: center; margin: 30px 0;'>
        <a href='${escape(storeUrl)}' style='background-color: #3182CE; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Empezar a comprar</a>
      </div>
      <p>Si tienes alguna duda, responde a este correo y nuestro equipo te ayudará.</p>
    </div>
    ${footer('Pasión por el papel.')}
  </div>`;
}

export function orderTemplate(
  nombre: string,
  orderId: number,
  total: number,
  items: { nombre: string; cantidad: number; precio: number }[],
): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style='padding: 10px; border-bottom: 1px solid #eee;'>${escape(item.nombre)}</td>
        <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>${item.cantidad}</td>
        <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>${money(item.precio * item.cantidad)}</td>
      </tr>`,
    )
    .join('');

  return `
  <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #ffffff;'>
    <div style='background: linear-gradient(135deg, #2F855A 0%, #48BB78 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
      <h1 style='color: white; margin: 0; font-size: 28px;'>¡Pedido Recibido!</h1>
      <p style='color: #e6fffa; margin-top: 10px;'>Orden #${orderId}</p>
    </div>
    <div style='padding: 20px; color: #333;'>
      <p style='font-size: 16px;'>Hola <b>${escape(nombre)}</b>,</p>
      <p>Tu pedido fue registrado con éxito. Este es el detalle de tu compra en <b>Mundo Librería</b>:</p>
      <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
        <thead>
          <tr style='background-color: #f7fafc;'>
            <th style='padding: 10px; text-align: left; border-bottom: 2px solid #edf2f7;'>Producto</th>
            <th style='padding: 10px; text-align: center; border-bottom: 2px solid #edf2f7;'>Cant.</th>
            <th style='padding: 10px; text-align: right; border-bottom: 2px solid #edf2f7;'>Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan='2' style='padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;'>Total:</td>
            <td style='padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #2F855A;'>${money(total)}</td>
          </tr>
        </tfoot>
      </table>
      <div style='background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0;'>
        <p style='margin: 0; font-size: 14px; color: #2a4365;'>
          <b>Información de envío:</b><br>
          Estamos preparando tus productos. Te notificaremos por correo cuando el despacho esté en camino.
        </p>
      </div>
      <p style='font-size: 14px; color: #718096; text-align: center; margin-top: 30px;'>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
    </div>
    ${footer('Este es un correo automático, por favor no respondas directamente.')}
  </div>`;
}

export function passwordResetTemplate(link: string): string {
  return `
  <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
    <div style='background: #4A5568; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
      <h1 style='color: white; margin: 0;'>Recuperar Contraseña</h1>
    </div>
    <div style='padding: 20px; color: #333;'>
      <p>Has solicitado restablecer tu contraseña en <b>Mundo Librería</b>.</p>
      <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expirará en 1 hora.</p>
      <div style='text-align: center; margin: 30px 0;'>
        <a href='${escape(link)}' style='background-color: #E53E3E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Restablecer Contraseña</a>
      </div>
      <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
    </div>
    ${footer('Seguridad ante todo.')}
  </div>`;
}
