package com.Project.Backend.Service;

import java.io.IOException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Project.Backend.Entity.UserEntity;
import com.Project.Backend.Repository.UserRepository;
import com.Project.Backend.Service.S3Service;

@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final CloudinaryService cloudinaryService;

    @Autowired
    private final S3Service s3Service;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    
    
    public UserService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, CloudinaryService cloudinaryService, S3Service s3Service) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.cloudinaryService = cloudinaryService;
        this.s3Service = s3Service;
    }

    public UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }

    public boolean userExistsByEmail(String Email) {
        return userRepository.findByEmail(Email) != null;
    }

    public List<UserEntity> getAllUsers() { 
        return userRepository.findAll();
    }
    public UserEntity registerUser(UserEntity user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String getUserProfileImage(String email) {
        UserEntity user = userRepository.findByEmail(email);
        return user.getProfilePicture();
    }

public UserEntity updateUserProfilePicture(String email, MultipartFile file) throws IOException {
        UserEntity user = userRepository.findByEmail(email);
        
        if (file != null && !file.isEmpty()) {
            // Delete the previous image from S3 (if it exists)
            String existingImageUrl = user.getProfilePicture();
            if (existingImageUrl != null && !existingImageUrl.isEmpty()) {
                // TODO: Implement S3 delete if needed
            }

            // Convert MultipartFile to File
            File convFile = File.createTempFile("upload", file.getOriginalFilename());
            file.transferTo(convFile);

            // Upload new image to S3
            String newImageUrl = s3Service.upload(convFile, "user_profiles", file.getOriginalFilename());
            user.setProfilePicture(newImageUrl);

            // Delete temp file
            convFile.delete();
        }

    return userRepository.save(user);
 }

    public boolean loginUser(String email, String password) {
        UserEntity user = userRepository.findByEmail(email);
        
        if (user == null) {
            return false; // User not found
        }
        
        return user.getPassword().equals(password);
    }

    public UserEntity getUserById(int userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteUser(int userId) {
        userRepository.deleteById(userId);
    }

    public boolean authenticate(String email, String password) {
        UserEntity user = userRepository.findByEmail(email);
        if(!user.getEmail().equals(email)){
            throw new UsernameNotFoundException("User not found");
        }

        if (!bCryptPasswordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return true;
    }
    public UserEntity updateUserInfoByEmail(String email, UserEntity updatedUser) {
        UserEntity existingUser = userRepository.findByEmail(email);
        if (existingUser == null) {
            throw new RuntimeException("User not found with email: " + email);
            }

                existingUser.setFirstname(updatedUser.getFirstname());
                existingUser.setLastname(updatedUser.getLastname());
                existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
                existingUser.setRegion(updatedUser.getRegion());
                existingUser.setProvince(updatedUser.getProvince());
                existingUser.setCityAndMul(updatedUser.getCityAndMul());
                existingUser.setBarangay(updatedUser.getBarangay());

                return userRepository.save(existingUser);
        }
    public void updateUserPassword(String email, String newPassword) {
        UserEntity user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }

            user.setPassword(bCryptPasswordEncoder.encode(newPassword));
            userRepository.save(user);
    }

    public boolean doesPasswordMatch(String email, String inputPassword) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        System.out.println(inputPassword);
        System.out.println(user.getPassword());
        return bCryptPasswordEncoder.matches(inputPassword, user.getPassword());
    }

    public String encodePassword(String password) {
        return bCryptPasswordEncoder.encode(password);
    }


}
