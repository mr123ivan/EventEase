package com.Project.Backend.Controller;

import com.Project.Backend.Service.OtpService;
import com.Project.Backend.Service.PasswordEmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/email")
public class EmailController {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private OtpService otpService;
    @Autowired
    private PasswordEmailService passwordEmailService;

    @RequestMapping("/send-email/{email}")
    public String sendHtmlEmail(@PathVariable("email") String recipient) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("no-reply@eventease.com");
            helper.setTo(recipient);
            helper.setSubject("EventEase OTP Request");
            String otp = otpService.generateOtp(recipient);

            // HTML with Tailwind-style inline CSS for compatibility
            String htmlContent =
                    "<div style=\"font-family: Arial, sans-serif; background-color: #f9fafb; padding: 2rem; border-radius: 0.5rem; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;\">" +
                            "<div style=\"text-align: center; margin-bottom: 1.5rem;\">" +
                            "<img src='https://capstone-planease.s3.ap-southeast-1.amazonaws.com/EventEaseLogo.png' style='height: 50px; display: inline-block;'/>" +
                            "</div>" +
                            "<h2 style=\"font-size: 1.25rem; font-weight: 600; color: #111827; text-align: center;\">Action Required – OTP Verification</h2>" +
                            "<p style=\"color: #374151; margin-top: 1rem;\">" +
                            "Hello," +
                            "</p>" +
                            "<div style=\"text-align: center; margin: 1.5rem 0;\">" +
                            "<span style=\"font-size: 1.875rem; font-weight: 700; color: #1f2937; background-color: #f3f4f6; padding: 0.75rem 1.5rem; border-radius: 0.375rem; display: inline-block;\">" +
                            otp +
                            "</span>" +
                            "</div>" +
                            "<p style=\"color: #6b7280;\">" +
                            "This code is valid for 5 minutes. If you didn't request this, please ignore this message." +
                            "</p>" +
                            "<hr style=\"margin-top: 2rem; border-color: #e5e7eb;\" />" +
                            "<p style=\"font-size: 0.875rem; color: #9ca3af; text-align: center; margin-top: 1rem;\">" +
                            "Thank you,<br/>" +
                            "EventEase Team" +
                            "</p>" +
                            "</div>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
            return "HTML email with logo sent successfully!";
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }

    @PostMapping("/send-password")
    public ResponseEntity<Map<String, Object>> sendPasswordEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String firstname = request.get("firstname");
            String lastname = request.get("lastname");

            if (email == null || password == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Email and password are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            passwordEmailService.sendPasswordEmail(email, password);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Password email sent successfully");
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to send password email: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/validate-otp")
    public ResponseEntity<Boolean> validateOtp(@RequestParam("email")String email, @RequestParam("OTP")String otp){
       boolean isValid = otpService.validateOtp(email, otp);
       if(isValid){
            otpService.clearOtp(email);
           return ResponseEntity.ok(true);
       }else{
           return ResponseEntity.ok(false);
       }
    }
}
