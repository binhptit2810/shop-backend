package com.shop.service;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse lockUnlockUser(Long userId, UserLockRequest request);
    void deleteUser(Long userId);
}
