package com.vehiclerental.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long vehicleId;
    private String vehicleName;
    private Long shopId;
    private String shopName;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    
    private Integer totalHours;
    private BigDecimal totalPrice;
    private String status;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime confirmationDeadline;
    private String notes;
    private String paymentStatus;
    private Long paymentId;
    private String paymentMethod;
    private String transactionId;
    private String paymentDate;
}
