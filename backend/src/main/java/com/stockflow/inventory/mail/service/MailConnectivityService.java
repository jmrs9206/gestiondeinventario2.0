package com.stockflow.inventory.mail.service;

import com.stockflow.inventory.mail.dto.MailConnectionStatus;
import jakarta.mail.Session;
import jakarta.mail.Store;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Properties;

@Service
public class MailConnectivityService {

    private final JavaMailSender mailSender;
    private final boolean imapEnabled;
    private final String imapHost;
    private final int imapPort;
    private final String imapUsername;
    private final String imapPassword;
    private final boolean imapSslEnabled;

    public MailConnectivityService(
            JavaMailSender mailSender,
            @Value("${app.mail.imap.enabled}") boolean imapEnabled,
            @Value("${app.mail.imap.host}") String imapHost,
            @Value("${app.mail.imap.port}") int imapPort,
            @Value("${app.mail.imap.username}") String imapUsername,
            @Value("${app.mail.imap.password}") String imapPassword,
            @Value("${app.mail.imap.ssl-enabled}") boolean imapSslEnabled
    ) {
        this.mailSender = mailSender;
        this.imapEnabled = imapEnabled;
        this.imapHost = imapHost;
        this.imapPort = imapPort;
        this.imapUsername = imapUsername;
        this.imapPassword = imapPassword;
        this.imapSslEnabled = imapSslEnabled;
    }

    public List<MailConnectionStatus> verifyConnections() {
        return List.of(verifySmtpConnection(), verifyImapConnection());
    }

    private MailConnectionStatus verifySmtpConnection() {
        if (!(mailSender instanceof JavaMailSenderImpl javaMailSender)) {
            return new MailConnectionStatus("SMTP", false, false, "", 0, "", "JavaMailSender no permite verificar conexión SMTP.");
        }

        String host = valueOrEmpty(javaMailSender.getHost());
        int port = javaMailSender.getPort();
        String username = valueOrEmpty(javaMailSender.getUsername());
        boolean configured = !host.isBlank() && port > 0 && !username.isBlank();
        if (!configured) {
            return new MailConnectionStatus("SMTP", false, false, host, port, username, "Configuración SMTP incompleta.");
        }

        try {
            javaMailSender.testConnection();
            return new MailConnectionStatus("SMTP", true, true, host, port, username, null);
        } catch (Exception ex) {
            return new MailConnectionStatus("SMTP", true, false, host, port, username, sanitizeError(ex));
        }
    }

    private MailConnectionStatus verifyImapConnection() {
        boolean configured = imapEnabled && !imapHost.isBlank() && imapPort > 0 && !imapUsername.isBlank() && !imapPassword.isBlank();
        if (!configured) {
            return new MailConnectionStatus("IMAP", false, false, valueOrEmpty(imapHost), imapPort, valueOrEmpty(imapUsername), "Configuración IMAP incompleta o deshabilitada.");
        }

        String protocol = imapSslEnabled ? "imaps" : "imap";
        Properties properties = new Properties();
        properties.put("mail.store.protocol", protocol);
        properties.put("mail." + protocol + ".connectiontimeout", "5000");
        properties.put("mail." + protocol + ".timeout", "5000");
        properties.put("mail." + protocol + ".writetimeout", "5000");
        properties.put("mail." + protocol + ".ssl.enable", Boolean.toString(imapSslEnabled));

        try {
            Session session = Session.getInstance(properties);
            Store store = session.getStore(protocol);
            store.connect(imapHost, imapPort, imapUsername, imapPassword);
            store.close();
            return new MailConnectionStatus("IMAP", true, true, imapHost, imapPort, imapUsername, null);
        } catch (Exception ex) {
            return new MailConnectionStatus("IMAP", true, false, imapHost, imapPort, imapUsername, sanitizeError(ex));
        }
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private String sanitizeError(Exception ex) {
        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            return ex.getClass().getSimpleName();
        }
        return message.replace(imapPassword, "[PROTECTED]");
    }
}
