package com.shop.service.impl;

import com.shop.dto.UserLockRequest;
import com.shop.dto.UserResponse;
import com.shop.dto.UpdateProfileRequest;
import com.shop.entity.Order;
import com.shop.entity.User;
import com.shop.entity.Role;
import com.shop.entity.Otp;
import com.shop.exception.BadRequestException;
import com.shop.repository.CartRepository;
import com.shop.repository.OrderRepository;
import com.shop.repository.UserRepository;
import com.shop.repository.OtpRepository;
import com.shop.service.UserService;
import com.shop.service.EmailService;
import com.shop.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    private UserResponse mapToUserResponse(User user) {
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
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
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

        return mapToUserResponse(updatedUser);
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

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        String newEmail = request.getEmail();
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equalsIgnoreCase(user.getEmail())) {
            // Check if the new email is already taken
            if (userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email đã được sử dụng bởi tài khoản khác!");
            }

            // Clean up old CHANGE_EMAIL OTPs for this new email
            otpRepository.deleteByEmailAndType(newEmail, "CHANGE_EMAIL");

            // Generate new OTP
            String otpCode = String.format("%06d", new Random().nextInt(1000000));
            Otp otp = Otp.builder()
                    .email(newEmail)
                    .otpCode(otpCode)
                    .type("CHANGE_EMAIL")
                    .expiryTime(LocalDateTime.now().plusMinutes(5))
                    .build();
            otpRepository.save(otp);

            // Send OTP email to the new email
            emailService.sendOtpEmail(newEmail, otpCode, "Xác nhận thay đổi email tài khoản BMart");
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse verifyChangeEmail(User currentUser, String newEmail, String otpCode) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        Otp otp = otpRepository.findByEmailAndOtpCodeAndType(newEmail, otpCode, "CHANGE_EMAIL")
                .orElseThrow(() -> new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new BadRequestException("Mã OTP đã hết hạn! Vui lòng thực hiện lại.");
        }

        if (userRepository.existsByEmail(newEmail)) {
            otpRepository.delete(otp);
            throw new BadRequestException("Email đã được sử dụng bởi tài khoản khác!");
        }

        user.setEmail(newEmail);
        otpRepository.delete(otp);
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateAvatar(User currentUser, MultipartFile file) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));

        // Store new avatar file
        String newAvatarUrl = fileStorageService.storeFile(file);

        // Delete old avatar file if it exists
        String oldAvatarUrl = user.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.trim().isEmpty()) {
            fileStorageService.deleteFile(oldAvatarUrl);
        }

        // Update avatar URL in DB
        user.setAvatarUrl(newAvatarUrl);
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }
}
