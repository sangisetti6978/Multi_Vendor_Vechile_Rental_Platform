package com.vehiclerental.service;

import com.vehiclerental.model.Payment;
import com.vehiclerental.repository.PaymentRepository;
import com.vehiclerental.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }
    
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }
    
    public Payment getPaymentByBooking(Long bookingId) {
        return paymentRepository.findFirstByBookingIdOrderByPaymentDateDesc(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking id: " + bookingId));
    }
    
    public List<Payment> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public Payment updatePaymentStatus(Long id, Payment.PaymentStatus status) {
        Payment payment = getPaymentById(id);
        payment.setPaymentStatus(status);
        return paymentRepository.save(payment);
    }
}
