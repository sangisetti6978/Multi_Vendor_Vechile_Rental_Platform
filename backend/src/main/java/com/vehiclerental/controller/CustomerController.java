package com.vehiclerental.controller;

import com.vehiclerental.dto.BookingDTO;
import com.vehiclerental.dto.SearchRequest;
import com.vehiclerental.dto.VehicleDTO;
import com.vehiclerental.model.Booking;
import com.vehiclerental.model.Payment;
import com.vehiclerental.model.Review;
import com.vehiclerental.service.BookingService;
import com.vehiclerental.service.PaymentService;
import com.vehiclerental.service.ReviewService;
import com.vehiclerental.service.UserService;
import com.vehiclerental.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Customer", description = "Customer management APIs")
public class CustomerController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PaymentService paymentService;
    
    @GetMapping("/vehicles/search")
    @Operation(summary = "Search vehicles", description = "Search and filter vehicles by location, type, brand, and price range")
    public ResponseEntity<List<VehicleDTO>> searchVehicles(@ModelAttribute SearchRequest request) {
        return ResponseEntity.ok(vehicleService.searchVehicles(request));
    }
    
    @GetMapping("/vehicles")
    @Operation(summary = "Get all vehicles", description = "Get list of all available vehicles")
    public ResponseEntity<List<VehicleDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }
    
    @GetMapping("/vehicles/{id}")
    @Operation(summary = "Get vehicle details", description = "Get detailed information about a specific vehicle")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleDTOById(id));
    }
    
    @PostMapping("/bookings")
    @Operation(summary = "Create booking", description = "Create a new vehicle booking")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking, Authentication auth) {
        String email = auth.getName();
        Long customerId = userService.getUserByEmail(email).getId();
        booking.setCustomerId(customerId);
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }
    
    @GetMapping("/bookings")
    @Operation(summary = "Get my bookings", description = "Get all bookings made by the current customer")
    public ResponseEntity<List<BookingDTO>> getMyBookings(Authentication auth) {
        String email = auth.getName();
        Long customerId = userService.getUserByEmail(email).getId();
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }
    
    @GetMapping("/bookings/{id}")
    @Operation(summary = "Get booking details", description = "Get detailed information about a specific booking")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingDTOById(id));
    }
    
    @PutMapping("/bookings/{id}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancel a booking")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
    
    @PostMapping("/reviews")
    @Operation(summary = "Create review", description = "Add a review for a completed booking")
    public ResponseEntity<Review> createReview(@RequestBody Review review, Authentication auth) {
        String email = auth.getName();
        Long customerId = userService.getUserByEmail(email).getId();
        review.setCustomerId(customerId);
        return ResponseEntity.ok(reviewService.createReview(review));
    }
    
    @GetMapping("/vehicles/{vehicleId}/reviews")
    @Operation(summary = "Get vehicle reviews", description = "Get all reviews for a specific vehicle")
    public ResponseEntity<List<Review>> getVehicleReviews(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(reviewService.getReviewsByVehicle(vehicleId));
    }
    
    @GetMapping("/bookings/{bookingId}/payment")
    @Operation(summary = "Get payment for booking", description = "Get payment details for a specific booking")
    public ResponseEntity<Payment> getPaymentForBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId));
    }
    
    @PostMapping("/bookings/{bookingId}/payment")
    @Operation(summary = "Process payment", description = "Process payment for an accepted booking")
    @Transactional
    public ResponseEntity<Payment> processPayment(@PathVariable Long bookingId, @RequestBody java.util.Map<String, String> paymentDetails) {
        Payment payment = paymentService.getPaymentByBooking(bookingId);
        
        if (payment.getPaymentStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new IllegalArgumentException("Payment has already been completed");
        }
        
        payment.setPaymentMethod(paymentDetails.get("paymentMethod"));
        payment.setTransactionId("TXN" + System.currentTimeMillis());
        if (paymentDetails.get("payerInfo") != null) {
            payment.setPayerInfo(paymentDetails.get("payerInfo"));
        }
        payment.setPaymentStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentDate(java.time.LocalDateTime.now());
        
        Payment updatedPayment = paymentService.createPayment(payment);
        
        // Update booking status to COMPLETED after successful payment
        bookingService.completeBooking(bookingId);
        
        return ResponseEntity.ok(updatedPayment);
    }
}
