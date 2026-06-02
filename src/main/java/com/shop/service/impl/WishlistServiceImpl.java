package com.shop.service.impl;

import com.shop.dto.WishlistResponse;
import com.shop.entity.Product;
import com.shop.entity.User;
import com.shop.entity.Wishlist;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.repository.ProductRepository;
import com.shop.repository.WishlistRepository;
import com.shop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(User user) {
        return wishlistRepository.findByUserId(user.getId()).stream()
                .map(wish -> WishlistResponse.builder()
                        .id(wish.getId())
                        .productId(wish.getProduct().getId())
                        .productName(wish.getProduct().getName())
                        .productImageUrl(wish.getProduct().getImageUrl())
                        .productPrice(wish.getProduct().getPrice())
                        .productDiscountPrice(wish.getProduct().getDiscountPrice())
                        .createdAt(wish.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistResponse addToWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("Sản phẩm này đã tồn tại trong danh sách yêu thích!");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        Wishlist saved = wishlistRepository.save(wishlist);

        return WishlistResponse.builder()
                .id(saved.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .productPrice(product.getPrice())
                .productDiscountPrice(product.getDiscountPrice())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong danh sách yêu thích!"));
        wishlistRepository.delete(wishlist);
    }
}
