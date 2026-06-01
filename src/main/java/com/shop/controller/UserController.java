package com.shop.controller;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import com.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
