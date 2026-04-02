package com.vehiclerental.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "shop_seq")
    @SequenceGenerator(name = "shop_seq", sequenceName = "shops_seq", allocationSize = 1)
    private Long id;
    
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;
    
    @Column(name = "shop_name", nullable = false)
    private String shopName;
    
    @Lob
    private String description;
    
    private String address;
    
    private String area;
    
    private String city;
    
    private String state;
    
    private String pincode;
    
    private String phone;
    
    private String email;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
