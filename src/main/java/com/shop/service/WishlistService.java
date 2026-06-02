package com.shop.service;

import com.shop.dto.WishlistResponse;
import com.shop.entity.User;

import java.util.List;

public interface WishlistService {
    List<WishlistResponse> getMyWishlist(User user);
    WishlistResponse addToWishlist(User user, Long productId);
    void removeFromWishlist(User user, Long productId);
}
