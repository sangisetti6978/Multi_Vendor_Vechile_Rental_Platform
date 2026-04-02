package com.vehiclerental.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_seq")
    @SequenceGenerator(name = "booking_seq", sequenceName = "bookings_seq", allocationSize = 1)
    private Long id;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;
    
    @Column(name = "shop_id", nullable = false)
    private Long shopId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "total_hours")
    private Integer totalHours;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(name = "booking_date")
    private LocalDateTime bookingDate;
    
    @Column(name = "confirmation_deadline")
    private LocalDateTime confirmationDeadline;
    
    @Lob
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum BookingStatus {
        PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
    }
}
