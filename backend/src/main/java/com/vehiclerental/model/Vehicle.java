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
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vehicle_seq")
    @SequenceGenerator(name = "vehicle_seq", sequenceName = "vehicles_seq", allocationSize = 1)
    private Long id;
    
    @Column(name = "shop_id", nullable = false)
    private Long shopId;
    
    @Column(name = "vehicle_name", nullable = false)
    private String vehicleName;
    
    private String brand;
    
    private String model;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType;
    
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private FuelType fuelType;
    
    @Enumerated(EnumType.STRING)
    private Transmission transmission;
    
    @Column(name = "seating_capacity")
    private Integer seatingCapacity;
    
    @Column(name = "price_per_day", nullable = false)
    private BigDecimal pricePerDay;
    
    @Lob
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum VehicleType {
        CAR, BIKE, SCOOTER, SUV, VAN, TRUCK
    }
    
    public enum FuelType {
        PETROL, DIESEL, ELECTRIC, HYBRID
    }
    
    public enum Transmission {
        MANUAL, AUTOMATIC
    }
}
