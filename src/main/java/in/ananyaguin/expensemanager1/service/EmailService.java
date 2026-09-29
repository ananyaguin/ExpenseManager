package in.ananyaguin.expensemanager1.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from:}")
    private String fromMail;

    @Value("${app.mail.from-name:Expense Manager}")
    private String fromName;

    @Value("${spring.mail.host:smtp-relay.brevo.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    private String getCleanFromMail() {
        if (fromMail == null || fromMail.trim().isEmpty()) {
            return (mailUsername != null) ? mailUsername.replace("\"", "").replace("'", "").trim() : "";
        }
        return fromMail.replace("\"", "").replace("'", "").trim();
    }

    private String getSenderFormatted() {
        String cleanEmail = getCleanFromMail();
        if (cleanEmail.isEmpty()) {
            return "";
        }
        if (fromName != null && !fromName.trim().isEmpty()) {
            return fromName.trim() + " <" + cleanEmail + ">";
        }
        return cleanEmail;
    }

    public void sendEmail(String to, String subject, String body) {
        System.out.println("[EMAIL] SMTP configuration loaded: YES (Host: " + mailHost + ":" + mailPort + ", User: " + mailUsername + ", From: " + getCleanFromMail() + ")");
        System.out.println("[EMAIL] Attempting to send email...");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(getSenderFormatted());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("[EMAIL] Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send activation email");
            System.err.println("[EMAIL ERROR] " + e.getClass().getName() + ": " + e.getMessage());
            Throwable cause = e.getCause();
            while (cause != null) {
                System.err.println("[EMAIL ERROR] Root cause: " + cause.getClass().getName() + ": " + cause.getMessage());
                cause = cause.getCause();
            }
            System.out.println("--------------------------------------------------");
            System.out.println("Local Account Activation Fallback:");
            System.out.println(body);
            System.out.println("--------------------------------------------------");
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        try {
            if (fromName != null && !fromName.trim().isEmpty()) {
                helper.setFrom(getCleanFromMail(), fromName.trim());
            } else {
                helper.setFrom(getCleanFromMail());
            }
        } catch (java.io.UnsupportedEncodingException e) {
            helper.setFrom(getCleanFromMail());
        }
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body);
        helper.addAttachment(filename, new ByteArrayResource(attachment));
        mailSender.send(message);
    }
}



