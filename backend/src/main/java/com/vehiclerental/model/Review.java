package com.vehiclerental.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq")
    @SequenceGenerator(name = "review_seq", sequenceName = "reviews_seq", allocationSize = 1)
    private Long id;
    
    @Column(name = "booking_id", nullable = false)
    private Long bookingId;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Lob
    @Column(name = "\"comment\"")
    private String comment;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
