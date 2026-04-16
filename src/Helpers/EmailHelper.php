<?php

namespace App\Helpers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Clase para manejar el envío de correos electrónicos usando PHPMailer.
 */
class EmailHelper {
    /**
     * Envía un correo electrónico profesional usando SMTP y PHPMailer.
     */
    public static function send($to, $subject, $htmlContent) {
        $user = $_ENV['SMTP_USER'] ?? '';
        
        // MODO DESARROLLO: Si el usuario es el placeholder o está vacío, logueamos en lugar de enviar.
        if (empty($user) || $user === 'tu-correo@gmail.com') {
            $logDir = __DIR__ . '/../../logs';
            if (!is_dir($logDir)) mkdir($logDir, 0755, true);
            
            $logEntry = "========================================\n";
            $logEntry .= "FECHA: " . date('Y-m-d H:i:s') . "\n";
            $logEntry .= "PARA: $to\n";
            $logEntry .= "ASUNTO: $subject\n";
            $logEntry .= "CONTENIDO:\n$htmlContent\n";
            $logEntry .= "========================================\n\n";
            
            file_put_contents($logDir . '/mail_debug.log', $logEntry, FILE_APPEND);
            return true; 
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['SMTP_USER'] ?? '';
            $mail->Password   = $_ENV['SMTP_PASS'] ?? '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $_ENV['SMTP_PORT'] ?? 587;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($_ENV['SMTP_USER'] ?? '', $_ENV['SMTP_FROM_NAME'] ?? 'Mundo Librería');
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlContent;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Error al enviar correo a $to: {$mail->ErrorInfo}");
            return false;
        }
    }

    public static function getWelcomeTemplate($nombre) {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
            <div style='background: linear-gradient(135deg, #E53E3E 0%, #3182CE 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='color: white; margin: 0;'>¡Bienvenido, $nombre!</h1>
            </div>
            <div style='padding: 20px; color: #333;'>
                <p>Estamos encantados de que te hayas unido a <b>Mundo Librería</b>.</p>
                <p>En nuestra tienda encontrarás todo lo que necesitas para tu oficina, estudio o proyectos creativos.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='http://localhost/Mundo-Libreria' style='background-color: #3182CE; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Empezar a comprar</a>
                </div>
                <p>Si tienes alguna duda, responde a este correo y nuestro equipo te ayudará.</p>
            </div>
            <hr style='border: 0; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #777; text-align: center;'>&copy; 2025 Mundo Librería. Pasión por el papel.</p>
        </div>";
    }

    public static function getOrderTemplate($nombre, $id_pedido, $total, $items = []) {
        $total_fmt = number_format($total, 0, ',', '.');
        $items_html = "";
        
        foreach ($items as $item) {
            $subtotal = number_format($item['precio'] * $item['cantidad'], 0, ',', '.');
            $items_html .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$item['nombre']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>{$item['cantidad']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>$$subtotal</td>
            </tr>";
        }

        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #ffffff;'>
            <div style='background: linear-gradient(135deg, #2F855A 0%, #48BB78 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='color: white; margin: 0; font-size: 28px;'>¡Pedido Recibido!</h1>
                <p style='color: #e6fffa; margin-top: 10px;'>Orden #$id_pedido</p>
            </div>
            <div style='padding: 20px; color: #333;'>
                <p style='font-size: 16px;'>Hola <b>$nombre</b>,</p>
                <p>Tu pedido ha sido procesado con éxito. Aquí tienes el detalle de tu compra en <b>Mundo Librería</b>:</p>
                
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <thead>
                        <tr style='background-color: #f7fafc;'>
                            <th style='padding: 10px; text-align: left; border-bottom: 2px solid #edf2f7;'>Producto</th>
                            <th style='padding: 10px; text-align: center; border-bottom: 2px solid #edf2f7;'>Cant.</th>
                            <th style='padding: 10px; text-align: right; border-bottom: 2px solid #edf2f7;'>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        $items_html
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='2' style='padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;'>Total:</td>
                            <td style='padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #2F855A;'>$$total_fmt</td>
                        </tr>
                    </tfoot>
                </table>

                <div style='background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0;'>
                    <p style='margin: 0; font-size: 14px; color: #2a4365;'>
                        <b>Información de Envío:</b><br>
                        Estamos preparando tus productos. Te notificaremos vía email cuando el despacho esté en camino.
                    </p>
                </div>
                
                <p style='font-size: 14px; color: #718096; text-align: center; margin-top: 30px;'>
                    Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                </p>
            </div>
            <div style='background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #edf2f7;'>
                <p style='font-size: 12px; color: #a0aec0; margin: 0;'>&copy; 2025 Mundo Librería. Pasión por el papel.</p>
                <p style='font-size: 10px; color: #cbd5e0; margin-top: 5px;'>Este es un correo automático, por favor no respondas directamente.</p>
            </div>
        </div>";
    }

    public static function getPasswordResetTemplate($link) {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
            <div style='background: #4A5568; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='color: white; margin: 0;'>Recuperar Contraseña</h1>
            </div>
            <div style='padding: 20px; color: #333;'>
                <p>Has solicitado restablecer tu contraseña en <b>Mundo Librería</b>.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expirará en 1 hora.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='$link' style='background-color: #E53E3E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Restablecer Contraseña</a>
                </div>
                <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
            <hr style='border: 0; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #777; text-align: center;'>&copy; 2025 Mundo Librería. Seguridad ante todo.</p>
        </div>";
    }
}
