package com.Project.Backend.Controller;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Project.Backend.DTO.LoginRequest;
import com.Project.Backend.Entity.UserEntity;
import com.Project.Backend.Service.TokenService;
import com.Project.Backend.Service.UserService;
import com.Project.Backend.Service.OtpService;

import jakarta.servlet.http.HttpSession;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    private final TokenService tokenService;

    public UserController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping("/create")
    public ResponseEntity<UserEntity> createUser(@RequestBody UserEntity user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity user) {
        UserEntity savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/getall")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/check-user")
    public Map<String, Boolean> checkUser(@RequestParam String email) {
        boolean exists = userService.userExistsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return response;
    }

    @PostMapping("/upload/profile/{userId}")
    public ResponseEntity<?> uploadUserProfilePicture(
            @PathVariable String userId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            UserEntity updatedUser = userService.updateUserProfilePicture(userId, file);
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Profile picture upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/getcurrentuser")
    public ResponseEntity<Map<String, String>> getSchoolId(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid token"));
        }

        String token = authHeader.substring(7);
        String email = tokenService.extractEmail(token);

        return ResponseEntity.ok(Collections.singletonMap("email", email));
    }

    @GetMapping("/profile/image")
    public ResponseEntity<?> getUserProfileImage(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid or missing token");
            }

            // Extract the actual token (remove "Bearer " prefix)
            token = token.substring(7);

            String email = tokenService.extractEmail(token);
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid token: Email missing");
            }

            // System.out.println("Fetching profile image for schoolId: " + schoolId); //
            // Debugging log

            String profileImage = userService.getUserProfileImage(email);

            if (profileImage == null || profileImage.isEmpty()) {
                return ResponseEntity.badRequest().body("No profile image found");
            }

            return ResponseEntity.ok(profileImage);
        } catch (Exception e) {
            e.printStackTrace(); // Debugging
            return ResponseEntity.status(500).body("Error fetching profile image: " + e.getMessage());
        }
    }

    @GetMapping("/getcurrentrole")
    public ResponseEntity<Map<String, String>> getUserRole(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid token"));
        }

        String token = authHeader.substring(7);
        String role = tokenService.extractRole(token);

        return ResponseEntity.ok(Collections.singletonMap("role", role));
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Logout successful";
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            boolean isAuthenticated = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

            if (isAuthenticated) {

                UserEntity user = userService.getUserByEmail(loginRequest.getEmail());

                Authentication authentication = new UsernamePasswordAuthenticationToken(user, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())));

                String token = tokenService.generateToken(authentication, user.getEmail(), user.getRole());

                session.setAttribute("user", loginRequest.getEmail());
                // System.out.println(session.getAttribute("user"));
                // System.out.println("Session ID: " + session.getId());

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("token", token);
                responseBody.put("user", loginRequest.getEmail());
                responseBody.put("role", user.getRole());
                return ResponseEntity.ok(responseBody);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable int id) {
        UserEntity user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/getuser")
    public ResponseEntity<UserEntity> getUserByToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String email = tokenService.extractEmail(token);

        UserEntity user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update")
    public ResponseEntity<UserEntity> updateUser(@RequestHeader("Authorization") String authHeader,
            @RequestBody UserEntity updatedUser) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String email = tokenService.extractEmail(token);

        try {
            UserEntity user = userService.updateUserInfoByEmail(email, updatedUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        String email = tokenService.extractEmail(token);
        String newPassword = request.get("newPassword");

        try {
            userService.updateUserPassword(email, newPassword);
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PostMapping("/check-password")
    public ResponseEntity<Map<String, Boolean>> checkPassword(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("match", false));
        }

        String token = authHeader.substring(7);
        String email = tokenService.extractEmail(token);
        String inputPassword = request.get("password");
        boolean matches = userService.doesPasswordMatch(email, inputPassword);
        return ResponseEntity.ok(Collections.singletonMap("match", matches));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Email, OTP, and new password are required");
        }

        // Validate OTP
        boolean isValidOtp = otpService.validateOtp(email, otp);
        if (!isValidOtp) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }

        try {
            userService.updateUserPassword(email, newPassword);
            otpService.clearOtp(email); // Clear OTP after successful reset
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/getCustomers")
    public ResponseEntity<List<UserEntity>> getCustomerUser() {
        List<UserEntity> customers = userService.getAllUsers()
                .stream()
                .filter(u -> u != null && u.getRole() != null && u.getRole().equalsIgnoreCase("User"))
                .collect(Collectors.toList());

        // Do not expose passwords in the API response
        customers.forEach(u -> {
            if (u != null) {
                u.setPassword(null);
            }
        });

        return ResponseEntity.ok(customers);
    }

}
