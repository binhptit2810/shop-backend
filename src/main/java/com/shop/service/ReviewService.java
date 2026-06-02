package com.shop.service;

import com.shop.dto.ReviewRequest;
import com.shop.dto.ReviewResponse;
import com.shop.entity.User;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> getProductReviews(Long productId);
    ReviewResponse addReview(User user, Long productId, ReviewRequest request);
}
