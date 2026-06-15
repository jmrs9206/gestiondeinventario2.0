package com.stockflow.inventory.mail.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${spring.mail.username}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.fromEmail = fromEmail;
    }

    public void sendCredentialsEmail(String toEmail, String firstName, String lastName, String rawPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Tus credenciales de acceso - StockFlow Gestión de Inventario");

            String htmlContent = buildCredentialsHtml(firstName, lastName, toEmail, rawPassword);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Credentials email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send credentials email to {}", toEmail, e);
            throw new RuntimeException("Error al enviar el correo con las credenciales: " + e.getMessage());
        }
    }

    private String buildCredentialsHtml(String firstName, String lastName, String email, String password) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='utf-8'>" +
                "  <style>" +
                "    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2eb; color: #1e293b; margin: 0; padding: 20px; }" +
                "    .container { max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }" +
                "    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }" +
                "    .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }" +
                "    .title { font-size: 20px; font-weight: 600; margin-top: 0; color: #0f172a; }" +
                "    .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
                "    .field { margin-bottom: 12px; font-size: 14px; }" +
                "    .label { font-weight: 600; color: #475569; display: inline-block; width: 140px; }" +
                "    .value { font-family: monospace; font-size: 15px; color: #0f172a; font-weight: bold; }" +
                "    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; margin-top: 20px; text-align: center; }" +
                "    .btn:hover { background-color: #1d4ed8; }" +
                "    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <div class='logo'>StockFlow</div>" +
                "    </div>" +
                "    <h2 class='title'>¡Hola, " + firstName + " " + lastName + "!</h2>" +
                "    <p>Se ha creado tu cuenta de acceso para la aplicación de <strong>Gestión de Inventario de StockFlow</strong>. A continuación encontrarás tus credenciales de acceso:</p>" +
                "    <div class='credentials-box'>" +
                "      <div class='field'><span class='label'>Enlace de Acceso:</span> <span class='value'><a href='" + frontendUrl + "' style='color: #2563eb; text-decoration: none;'>" + frontendUrl + "</a></span></div>" +
                "      <div class='field'><span class='label'>Usuario (Email):</span> <span class='value'>" + email + "</span></div>" +
                "      <div class='field'><span class='label'>Contraseña:</span> <span class='value'>" + password + "</span></div>" +
                "    </div>" +
                "    <p>Por seguridad, te recomendamos cambiar la contraseña una vez ingreses a la plataforma.</p>" +
                "    <a href='" + frontendUrl + "/login' class='btn'>Acceder a la Aplicación</a>" +
                "    <div class='footer'>" +
                "      Este es un correo automático, por favor no respondas a este mensaje.<br>" +
                "      &copy; " + java.time.Year.now().getValue() + " StockFlow. Todos los derechos reservados." +
                "    </div>" +
                "    <div style='display:none; white-space:nowrap; font:15px/0 serif;'> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
