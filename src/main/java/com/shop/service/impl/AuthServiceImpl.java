package com.shop.service.impl;

import com.shop.dto.AuthResponse;
import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;
import com.shop.dto.ChangePasswordRequest;
import com.shop.dto.ChangePasswordConfirmRequest;
import com.shop.dto.ForgotPasswordRequest;
import com.shop.dto.ForgotPasswordConfirmRequest;
import com.shop.entity.Role;
import com.shop.entity.User;
import com.shop.exception.BadRequestException;
import com.shop.repository.UserRepository;
import com.shop.repository.OtpRepository;
import com.shop.repository.CartRepository;
import com.shop.security.JwtService;
import com.shop.service.AuthService;
import com.shop.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final CartRepository cartRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Nếu tên đăng nhập đã được sử dụng nhưng tài khoản chưa được kích hoạt, xóa nó đi để đăng ký lại
        userRepository.findByUsername(request.getUsername()).ifPresent(existingUser -> {
            if (!existingUser.isEnabled()) {
                otpRepository.deleteByEmailAndType(existingUser.getEmail(), "VERIFY_REGISTER");
                cartRepository.findByUserId(existingUser.getId()).ifPresent(cartRepository::delete);
                userRepository.delete(existingUser);
                userRepository.flush(); // đồng bộ ngay lập tức để không lỗi unique constraint
            }
        });

        // Nếu email đã được sử dụng nhưng tài khoản chưa được kích hoạt, xóa nó đi để đăng ký lại
        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.isEnabled()) {
                otpRepository.deleteByEmailAndType(existingUser.getEmail(), "VERIFY_REGISTER");
                cartRepository.findByUserId(existingUser.getId()).ifPresent(cartRepository::delete);
                userRepository.delete(existingUser);
                userRepository.flush(); // đồng bộ ngay lập tức
            }
        });

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' đã tồn tại!");
        }

        // Xác định role: chỉ cho phép USER hoặc SELLER, không cho tự cấp ADMIN
        Role role = Role.USER;
        if ("SELLER".equalsIgnoreCase(request.getRole())) {
            role = Role.SELLER;
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(role)
                .isEnabled(false) // Mặc định chưa kích hoạt
                .build();

        User savedUser = userRepository.save(user);

        // Sinh mã OTP kích hoạt tài khoản
        otpRepository.deleteByEmailAndType(savedUser.getEmail(), "VERIFY_REGISTER");
        String otpCode = generateOtpCode();
        com.shop.entity.Otp otp = com.shop.entity.Otp.builder()
                .email(savedUser.getEmail())
                .otpCode(otpCode)
                .type("VERIFY_REGISTER")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpRepository.save(otp);

        // Gửi email chứa mã OTP kích hoạt
        emailService.sendOtpEmail(savedUser.getEmail(), otpCode, "Xác thực kích hoạt tài khoản BMart");

        return AuthResponse.builder()
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .message("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực tài khoản.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse verifyRegister(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trên hệ thống!"));

        if (user.isEnabled()) {
            throw new BadRequestException("Tài khoản của bạn đã được kích hoạt trước đó rồi!");
        }

        com.shop.entity.Otp otp = otpRepository.findByEmailAndOtpCodeAndType(
                email, otpCode, "VERIFY_REGISTER")
                .orElseThrow(() -> new BadRequestException("Mã OTP xác thực không chính xác!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn kích hoạt (hiệu lực 5 phút)!");
        }

        // Kích hoạt tài khoản
        user.setEnabled(true);
        userRepository.save(user);
        otpRepository.delete(otp);

        // Tạo JWT token sau khi kích hoạt thành công để đăng nhập luôn
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Kích hoạt tài khoản thành công!")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Lấy thông tin người dùng từ DB trước để kiểm tra trạng thái và nạp thông tin
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Tài khoản hoặc mật khẩu không chính xác!"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa! Lý do: " + 
                    (user.getStatusReason() != null && !user.getStatusReason().trim().isEmpty() 
                            ? user.getStatusReason() 
                            : "Không có lý do cụ thể."));
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new BadRequestException("Tài khoản của bạn chưa được kích hoạt! Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.");
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadRequestException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private String generateOtpCode() {
        return String.format("%06d", new java.util.Random().nextInt(1000000));
    }

    @Override
    @Transactional
    public void requestChangePassword(User currentUser, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác!");
        }
        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp!");
        }

        otpRepository.deleteByEmailAndType(currentUser.getEmail(), "CHANGE_PASSWORD");

        String otpCode = generateOtpCode();
        com.shop.entity.Otp otp = com.shop.entity.Otp.builder()
                .email(currentUser.getEmail())
                .otpCode(otpCode)
                .type("CHANGE_PASSWORD")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpRepository.save(otp);

        emailService.sendOtpEmail(currentUser.getEmail(), otpCode, "Đổi mật khẩu tài khoản BMart");
    }

    @Override
    @Transactional
    public void confirmChangePassword(User currentUser, ChangePasswordConfirmRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác!");
        }
        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp!");
        }

        com.shop.entity.Otp otp = otpRepository.findByEmailAndOtpCodeAndType(
                currentUser.getEmail(), request.getOtpCode(), "CHANGE_PASSWORD")
                .orElseThrow(() -> new BadRequestException("Mã OTP không chính xác!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn (hiệu lực 5 phút)!");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        otpRepository.delete(otp);
    }

    @Override
    @Transactional
    public void requestForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trên hệ thống!"));

        otpRepository.deleteByEmailAndType(user.getEmail(), "FORGOT_PASSWORD");

        String otpCode = generateOtpCode();
        com.shop.entity.Otp otp = com.shop.entity.Otp.builder()
                .email(user.getEmail())
                .otpCode(otpCode)
                .type("FORGOT_PASSWORD")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpRepository.save(otp);

        emailService.sendOtpEmail(user.getEmail(), otpCode, "Khôi phục mật khẩu tài khoản BMart");
    }

    @Override
    @Transactional
    public void confirmForgotPassword(ForgotPasswordConfirmRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp!");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trên hệ thống!"));

        com.shop.entity.Otp otp = otpRepository.findByEmailAndOtpCodeAndType(
                request.getEmail(), request.getOtpCode(), "FORGOT_PASSWORD")
                .orElseThrow(() -> new BadRequestException("Mã OTP hoặc email xác thực không chính xác!"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn (hiệu lực 5 phút)!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpRepository.delete(otp);
    }
}
