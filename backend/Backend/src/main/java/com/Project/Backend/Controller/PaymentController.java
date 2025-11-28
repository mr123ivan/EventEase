package com.Project.Backend.Controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import com.Project.Backend.Service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;
import com.Project.Backend.Entity.PaymentEntity;
import com.Project.Backend.DTO.CreatePayment;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/generate-PresignedUrl")
    public ResponseEntity<?> generatePresignedURL(
            @RequestParam("file_name") String fileName,
            @RequestParam("user_name") String userName) {
        String uuidName = java.util.UUID.randomUUID() + "_" + fileName;

        try {
            String presignedURL = paymentService.generatePresignedUrl(userName, uuidName);
            return ResponseEntity.ok(Map.of("presignedURL", presignedURL, "uuidName", uuidName));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentEntity> getPaymentById(@PathVariable int paymentId) {
        PaymentEntity payment = paymentService.getPaymentById(paymentId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/create")
    public ResponseEntity<PaymentEntity> createPayment(@RequestBody CreatePayment payment) {
        PaymentEntity createdPayment = paymentService.savePayment(payment);
        return ResponseEntity.ok(createdPayment);
    }

}
