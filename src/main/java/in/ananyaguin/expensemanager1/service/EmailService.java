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
@Value("${spring.mail.properties.mail.smtp.from}")
private String fromMail;

    private String getCleanFromMail() {
        if (fromMail == null) {
            return "";
        }
        return fromMail.replace("\"", "").replace("'", "").trim();
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(getCleanFromMail());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Activation email sent successfully to: " + to);
        } catch (Exception e) {
            String errorDetail = e.getMessage();
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                errorDetail += " (Cause: " + e.getCause().getMessage() + ")";
            }
            System.err.println("Email sending failed for " + to + ": " + errorDetail);
            System.out.println("--------------------------------------------------");
            System.out.println("Local Account Activation Fallback:");
            System.out.println(body);
            System.out.println("--------------------------------------------------");
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(getCleanFromMail());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body);
        helper.addAttachment(filename, new ByteArrayResource(attachment));
        mailSender.send(message);
    }
}



