package com.Project.Backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordEmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendPasswordEmail(String to, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your EventEase Subcontractor Account Password");
            message.setText("Welcome to EventEase!\n\n" +
                           "Your subcontractor account has been created successfully.\n\n" +
                           "Your login credentials:\n" +
                           "Email: " + to + "\n" +
                           "Password: " + password + "\n\n" +
                           "Please change your password after your first login for security reasons.\n\n" +
                           "Best regards,\n" +
                           "EventEase Team");

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
