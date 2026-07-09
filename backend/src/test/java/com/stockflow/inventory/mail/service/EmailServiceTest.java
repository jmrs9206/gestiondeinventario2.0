package com.stockflow.inventory.mail.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailServiceTest {

    @Test
    void invitationEmailEscapesHtmlAndEncodesUrlParameters() throws Exception {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);

        EmailService emailService = new EmailService(mailSender, "https://inventory.example", "noreply@example.com");

        assertThat(emailService.escapeHtml("<script>alert(1)</script>")).isEqualTo("&lt;script&gt;alert(1)&lt;/script&gt;");
        assertThat(emailService.escapeHtml("O'Connor")).isEqualTo("O&#39;Connor");
        assertThat(emailService.encodeUrlParam("token with spaces&symbols")).isEqualTo("token+with+spaces%26symbols");
        assertThat(emailService.encodeUrlParam("user+qa@example.com")).isEqualTo("user%2Bqa%40example.com");

        emailService.sendInvitationEmail(
                "user+qa@example.com",
                "<script>alert(1)</script>",
                "O'Connor",
                "token with spaces&symbols"
        );

        String html = extractHtml(message);

        assertThat(html).doesNotContain("<script>alert(1)</script>");
        assertThat(html).doesNotContain("invitationToken=token with spaces&symbols");
        assertThat(html).doesNotContain("email=user+qa@example.com");
        verify(mailSender).send(message);
    }

    @Test
    void credentialsEmailEscapesUserControlledHtml() throws Exception {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);

        EmailService emailService = new EmailService(mailSender, "https://inventory.example", "noreply@example.com");

        assertThat(emailService.escapeHtml("<b>Ada</b>")).isEqualTo("&lt;b&gt;Ada&lt;/b&gt;");
        assertThat(emailService.escapeHtml("pass<&>\"'")).isEqualTo("pass&lt;&amp;&gt;&quot;&#39;");

        emailService.sendCredentialsEmail(
                "admin@example.com",
                "<b>Ada</b>",
                "Lovelace",
                "pass<&>\"'"
        );

        String html = extractHtml(message);

        assertThat(html).doesNotContain("<b>Ada</b>");
        assertThat(html).doesNotContain("pass<&>\"'");
        verify(mailSender).send(message);
    }

    private String extractHtml(MimeMessage message) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        message.writeTo(output);
        return output.toString(StandardCharsets.UTF_8);
    }
}
