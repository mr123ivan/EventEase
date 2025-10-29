package com.Project.Backend.Service;

import com.Project.Backend.Entity.NotificationEntity;
import com.Project.Backend.Entity.UserEntity;
import com.Project.Backend.Repository.NotificationRepository;
import com.Project.Backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new notification for a user
     */
    public NotificationEntity createNotification(String userEmail, String recipientType, String message, String notificationType) {
        UserEntity user = userRepository.findByEmail(userEmail);
        
        if (user != null) {
            NotificationEntity notification = new NotificationEntity(user, recipientType, message, notificationType);
            return notificationRepository.save(notification);
        }
        
        return null;
    }
    
    /**
     * Get all notifications for a user
     */
    public List<NotificationEntity> getUserNotifications(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user != null) {
            return notificationRepository.findByUser(user);
        }
        return List.of();
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<NotificationEntity> getUnreadNotifications(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user != null) {
            return notificationRepository.findByUserAndIsReadFalseOrderByNotificationDateDesc(user);
        }
        return List.of();
    }
    
    /**
     * Count unread notifications for a user
     */
    public long countUnreadNotifications(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user != null) {
            return notificationRepository.countByUserAndIsReadFalse(user);
        }
        return 0;
    }
    
    /**
     * Mark a notification as read
     */
    public NotificationEntity markAsRead(int notificationId) {
        Optional<NotificationEntity> notificationOpt = notificationRepository.findById(notificationId);
        
        if (notificationOpt.isPresent()) {
            NotificationEntity notification = notificationOpt.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        
        return null;
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user != null) {
            List<NotificationEntity> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByNotificationDateDesc(user);
            for (NotificationEntity notification : unreadNotifications) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        }
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(int notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Get notifications by type for a user
     */
    public List<NotificationEntity> getNotificationsByType(String userEmail, String notificationType) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user != null) {
            return notificationRepository.findByUserAndNotificationTypeOrderByNotificationDateDesc(user, notificationType);
        }
        return List.of();
    }
    
    /**
     * Create a welcome notification for a new user
     */
    public NotificationEntity createWelcomeNotification(String userEmail) {
        return createNotification(
            userEmail,
            "User",
            "Hey there! Welcome to EventEase. Begin your journey by exploring our event services.",
            "welcome"
        );
    }
    
    /**
     * Create a booking approval notification
     */
    public NotificationEntity createBookingApprovalNotification(String userEmail, String amount) {
        return createNotification(
            userEmail,
            "User",
            "Your booking has been approved by the event contractor.",
            "booking-approved"
        );
    }
    
    /**
     * Create a booking rejection notification
     */
    public NotificationEntity createBookingRejectionNotification(String userEmail, String reason) {
        return createNotification(
            userEmail,
            "User",
                reason,
            "booking-rejected"
        );
    }

    /**
     * Notify all users by role
     */
    public void notifyUsersByRole(String role, String message) {
        List<UserEntity> users = userRepository.findAllByRole(role);
        for (UserEntity user : users) {
            NotificationEntity notification = new NotificationEntity();
            notification.setUser(user);
            notification.setNotificationMessage(message);
            notification.setNotificationType("system");
            notification.setNotificationDate(new Date());
            notification.setRead(false);
            notificationRepository.save(notification);
        }
    }

    /**
     * Notify subcontractors related to a package
     */
    public void notifySubcontractorsByPackage(int packageId, String message) {
        List<UserEntity> subcontractors = userRepository.findSubcontractorsByPackageId(packageId);
        for (UserEntity subcontractor : subcontractors) {
            NotificationEntity notification = new NotificationEntity();
            notification.setUser(subcontractor);
            notification.setNotificationMessage(message);
            notification.setNotificationType("system");
            notification.setNotificationDate(new Date());
            notification.setRead(false);
            notificationRepository.save(notification);
        }
    }

    /**
     * Notify subcontractor by subcontractor ID
     */
    public NotificationEntity notifySubcontractorById(int subcontractorId, String message) {
        NotificationEntity notification = null;
        try{
            UserEntity subcontractor = userRepository.findById(subcontractorId).orElse(null);
            if (subcontractor != null) {
                notification = new NotificationEntity();
                notification.setUser(subcontractor);
                notification.setNotificationMessage(message);
                notification.setNotificationType("system");
                notification.setNotificationRecipientType("SubContractor");
                notification.setNotificationDate(new Date());
                notification.setRead(false);
                notification =  notificationRepository.save(notification);
            }
        }catch (Exception e) {
            return null;
        }
        return notification;
    }
}
