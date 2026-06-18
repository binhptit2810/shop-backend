package com.shop.service;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse lockUnlockUser(Long userId, UserLockRequest request);
    void deleteUser(Long userId);
    UserResponse changeUserRole(Long userId, String newRole);
    UserResponse updateProfile(com.shop.entity.User currentUser, com.shop.dto.UpdateProfileRequest request);
    UserResponse verifyChangeEmail(com.shop.entity.User currentUser, String newEmail, String otpCode);
    UserResponse updateAvatar(com.shop.entity.User currentUser, org.springframework.web.multipart.MultipartFile file);
}
