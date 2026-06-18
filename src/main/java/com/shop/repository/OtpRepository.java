package com.shop.repository;

import com.shop.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findByEmailAndOtpCodeAndType(String email, String otpCode, String type);

    void deleteByEmailAndType(String email, String type);
}
