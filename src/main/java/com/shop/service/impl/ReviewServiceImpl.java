package com.shop.service.impl;

import com.shop.dto.ReviewRequest;
import com.shop.dto.ReviewResponse;
import com.shop.entity.Product;
import com.shop.entity.Review;
import com.shop.entity.User;
import com.shop.entity.OrderStatus;
import com.shop.exception.ResourceNotFoundException;
import com.shop.exception.BadRequestException;
import com.shop.repository.ProductRepository;
import com.shop.repository.ReviewRepository;
import com.shop.repository.OrderRepository;
import com.shop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(rev -> ReviewResponse.builder()
                        .id(rev.getId())
                        .username(rev.getUser().getUsername())
                        .rating(rev.getRating())
                        .comment(rev.getComment())
                        .imageUrl(rev.getImageUrl())
                        .createdAt(rev.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse addReview(User user, Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        // Kiểm tra xem người dùng đã mua sản phẩm này và đơn hàng giao thành công / hoàn thành chưa
        boolean hasPurchased = orderRepository.existsByUserIdAndProductIdAndStatusIn(
                user.getId(),
                productId,
                Arrays.asList(OrderStatus.DELIVERED, OrderStatus.COMPLETED)
        );

        if (!hasPurchased) {
            throw new BadRequestException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công!");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .build();
        Review saved = reviewRepository.save(review);

        return ReviewResponse.builder()
                .id(saved.getId())
                .username(user.getUsername())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .imageUrl(saved.getImageUrl())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
