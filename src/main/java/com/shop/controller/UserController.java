package com.shop.controller;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import com.shop.dto.UpdateProfileRequest;
import com.shop.entity.User;
import com.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<UserResponse> lockUnlockUser(
            @PathVariable Long id,
            @RequestBody UserLockRequest request) {
        return ResponseEntity.ok(userService.lockUnlockUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }

    @PostMapping("/profile/verify-email")
    public ResponseEntity<UserResponse> verifyChangeEmail(
            @AuthenticationPrincipal User currentUser,
            @RequestParam String newEmail,
            @RequestParam String otpCode) {
        return ResponseEntity.ok(userService.verifyChangeEmail(currentUser, newEmail, otpCode));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<UserResponse> updateAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(currentUser, file));
    }
}
