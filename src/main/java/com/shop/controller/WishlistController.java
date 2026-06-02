package com.shop.controller;

import com.shop.dto.WishlistResponse;
import com.shop.entity.User;
import com.shop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistService.getMyWishlist(user));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(user, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.noContent().build();
    }
}
