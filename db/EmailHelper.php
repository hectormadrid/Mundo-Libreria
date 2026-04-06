<?php
/**
 * Clase para manejar el envío de correos electrónicos usando PHPMailer.
 */

// Cargar el autoloader de Composer
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class EmailHelper {
    /**
     * Envía un correo electrónico profesional usando SMTP y PHPMailer.
     */
    public static function send($to, $subject, $htmlContent) {
        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor SMTP desde el .env
            $mail->isSMTP();
            $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['SMTP_USER'] ?? '';
            $mail->Password   = $_ENV['SMTP_PASS'] ?? '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $_ENV['SMTP_PORT'] ?? 587;
            $mail->CharSet    = 'UTF-8';

            // Remitente y Destinatario
            $mail->setFrom($_ENV['SMTP_USER'] ?? '', $_ENV['SMTP_FROM_NAME'] ?? 'Mundo Librería');
            $mail->addAddress($to);

            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlContent;

            $mail->send();
            return true;
        } catch (Exception $e) {
            // Guardar error en logs si falla
            error_log("Error al enviar correo a $to: {$mail->ErrorInfo}");
            return false;
        }
    }

    /**
     * Genera la plantilla HTML para el correo de bienvenida.
     */
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

    /**
     * Genera la plantilla HTML para la confirmación de pedido.
     */
    public static function getOrderTemplate($nombre, $id_pedido, $total) {
        $total_fmt = number_format($total, 0, ',', '.');
        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
            <div style='background: #2F855A; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='color: white; margin: 0;'>¡Pedido Confirmado!</h1>
            </div>
            <div style='padding: 20px; color: #333;'>
                <p>Hola $nombre,</p>
                <p>Tu pedido <b>#$id_pedido</b> ha sido recibido con éxito y ya estamos trabajando en él.</p>
                <div style='background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p style='margin: 5px 0;'><b>ID del Pedido:</b> #$id_pedido</p>
                    <p style='margin: 5px 0;'><b>Total pagado:</b> $$total_fmt</p>
                    <p style='margin: 5px 0;'><b>Estado:</b> Procesando</p>
                </div>
                <p>Te enviaremos otro correo cuando tu pedido sea despachado.</p>
            </div>
            <hr style='border: 0; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #777; text-align: center;'>&copy; 2025 Mundo Librería. Gracias por tu preferencia.</p>
        </div>";
    }

    /**
     * Genera la plantilla HTML para la recuperación de contraseña.
     */
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
?>
