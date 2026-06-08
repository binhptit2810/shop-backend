package com.shop.service.impl;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import com.shop.entity.Order;
import com.shop.entity.User;
import com.shop.entity.Role;
import com.shop.exception.BadRequestException;
import com.shop.repository.CartRepository;
import com.shop.repository.OrderRepository;
import com.shop.repository.UserRepository;
import com.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            int totalOrders = orders.size();
            double totalSpent = orders.stream()
                    .map(Order::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .doubleValue();

            return UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .isLocked(user.isLocked())
                    .statusReason(user.getStatusReason())
                    .createdAt(user.getCreatedAt())
                    .totalOrders(totalOrders)
                    .totalSpent(totalSpent)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse lockUnlockUser(Long userId, UserLockRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Không thể khóa hoặc vô hiệu hóa tài khoản Quản trị viên (ADMIN)!");
        }

        user.setLocked(request.isLocked());
        user.setStatusReason(request.isLocked() ? request.getReason() : null);
        User updatedUser = userRepository.save(user);

        // Trả về DTO cập nhật mới nhất
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int totalOrders = orders.size();
        double totalSpent = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

        return UserResponse.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().name())
                .isLocked(updatedUser.isLocked())
                .statusReason(updatedUser.getStatusReason())
                .createdAt(updatedUser.getCreatedAt())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        if (user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Không thể xóa tài khoản Quản trị viên (ADMIN)!");
        }

        // Kiểm tra lịch sử đơn hàng
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!orders.isEmpty()) {
            throw new BadRequestException("Không thể xóa tài khoản đã có lịch sử đặt hàng. Hãy sử dụng chức năng Khóa tài khoản để vô hiệu hóa tài khoản của họ.");
        }

        // Xóa giỏ hàng trước để tránh lỗi ràng buộc khóa ngoại
        cartRepository.findByUserId(userId).ifPresent(cartRepository::delete);

        // Xóa người dùng
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Không thể thay đổi vai trò của tài khoản Quản trị viên (ADMIN)!");
        }

        Role targetRole;
        try {
            targetRole = Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Vai trò không hợp lệ! Chỉ chấp nhận USER hoặc SELLER.");
        }

        if (targetRole == Role.ADMIN) {
            throw new BadRequestException("Không thể nâng cấp người dùng khác thành Quản trị viên (ADMIN)!");
        }

        user.setRole(targetRole);
        User updatedUser = userRepository.save(user);

        // Trả về DTO cập nhật mới nhất kèm thống kê đơn hàng
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int totalOrders = orders.size();
        double totalSpent = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

        return UserResponse.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().name())
                .isLocked(updatedUser.isLocked())
                .statusReason(updatedUser.getStatusReason())
                .createdAt(updatedUser.getCreatedAt())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .build();
    }
}
