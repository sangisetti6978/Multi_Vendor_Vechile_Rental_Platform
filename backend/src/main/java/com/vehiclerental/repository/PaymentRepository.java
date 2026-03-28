package com.vehiclerental.repository;

import com.vehiclerental.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(Long bookingId);
    
    Optional<Payment> findFirstByBookingIdOrderByPaymentDateDesc(Long bookingId);
    
    List<Payment> findByPaymentStatus(Payment.PaymentStatus status);
}
