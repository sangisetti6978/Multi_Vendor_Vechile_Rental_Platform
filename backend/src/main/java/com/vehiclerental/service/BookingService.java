package com.vehiclerental.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vehiclerental.dto.BookingDTO;
import com.vehiclerental.exception.ResourceNotFoundException;
import com.vehiclerental.model.Booking;
import com.vehiclerental.model.Payment;
import com.vehiclerental.model.Shop;
import com.vehiclerental.model.User;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.PaymentRepository;
import com.vehiclerental.repository.ShopRepository;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.repository.VehicleRepository;

@Service
@Transactional
public class BookingService {
    
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ShopRepository shopRepository;
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Value("${booking.cancellation.delay:120}")
    private long cancellationDelayMinutes; // Default 2 hours (120 minutes)
    
    public Booking createBooking(Booking booking) {
        // Validate vehicle exists and is available
        Vehicle vehicle = vehicleService.getVehicleById(booking.getVehicleId());
        
        if (!vehicle.getIsAvailable() || !vehicle.getIsActive()) {
            throw new IllegalArgumentException("Vehicle is not available for booking");
        }
        
        // Check for overlapping bookings
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
            booking.getVehicleId(), booking.getStartTime(), booking.getEndTime()
        );
        
        if (!overlappingBookings.isEmpty()) {
            throw new IllegalArgumentException("Vehicle is already booked for the selected time slot");
        }
        
        // Calculate total days and price
        long hours = ChronoUnit.HOURS.between(booking.getStartTime(), booking.getEndTime());
        long days = Math.max(1, (hours + 23) / 24); // Round up to full days
        booking.setTotalHours((int) hours);
        booking.setTotalPrice(vehicle.getPricePerDay().multiply(java.math.BigDecimal.valueOf(days)));
        
        // Set booking details
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setBookingDate(LocalDateTime.now());
        booking.setConfirmationDeadline(LocalDateTime.now().plusMinutes(cancellationDelayMinutes));
        booking.setShopId(vehicle.getShopId());
        
        // Update vehicle availability
        vehicle.setIsAvailable(false);
        vehicleRepository.save(vehicle);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send notification to owner
        emailService.sendBookingNotificationToOwner(savedBooking);
        
        return savedBooking;
    }
    
    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public BookingDTO getBookingDTOById(Long id) {
        Booking booking = getBookingById(id);
        return convertToDTO(booking);
    }
    
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByShop(Long shopId) {
        return bookingRepository.findByShopId(shopId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByVehicle(Long vehicleId) {
        return bookingRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Booking acceptBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be accepted");
        }
        
        booking.setStatus(Booking.BookingStatus.ACCEPTED);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Auto-create a pending payment for this booking
        List<Payment> existingPayments = paymentRepository.findByBookingId(bookingId);
        if (existingPayments.isEmpty()) {
            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setAmount(updatedBooking.getTotalPrice());
            payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
            payment.setPaymentDate(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
        }
        
        // Send confirmation to customer
        emailService.sendBookingConfirmationToCustomer(updatedBooking);
        
        return updatedBooking;
    }
    
    @Transactional
    public Booking rejectBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(Booking.BookingStatus.REJECTED);
        
        // Make vehicle available again
        Vehicle vehicle = vehicleService.getVehicleById(booking.getVehicleId());
        vehicle.setIsAvailable(true);
        vehicleRepository.save(vehicle);
        
        return bookingRepository.save(booking);
    }
    
    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed bookings cannot be cancelled");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        
        // Make vehicle available again
        Vehicle vehicle = vehicleService.getVehicleById(booking.getVehicleId());
        vehicle.setIsAvailable(true);
        vehicleRepository.save(vehicle);
        
        return bookingRepository.save(booking);
    }
    
    @Transactional
    public Booking completeBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getStatus() != Booking.BookingStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only accepted bookings can be completed");
        }
        
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        
        // Make vehicle available again
        Vehicle vehicle = vehicleService.getVehicleById(booking.getVehicleId());
        vehicle.setIsAvailable(true);
        vehicleRepository.save(vehicle);
        
        return bookingRepository.save(booking);
    }
    
    @Transactional
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    public void autoCancelExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(now);
        
        if (expiredBookings.isEmpty()) {
            return;
        }
        
        logger.info("Found {} expired pending bookings to cancel", expiredBookings.size());
        
        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            
            // Make vehicle available again
            Vehicle vehicle = vehicleService.getVehicleById(booking.getVehicleId());
            vehicle.setIsAvailable(true);
            vehicleRepository.save(vehicle);
            
            bookingRepository.save(booking);
            
            // Send cancellation notification
            emailService.sendBookingCancellationNotification(booking);
            
            logger.info("Auto-cancelled booking {} due to confirmation deadline expiration", booking.getId());
        }
    }
    
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCustomerId(booking.getCustomerId());
        dto.setVehicleId(booking.getVehicleId());
        dto.setShopId(booking.getShopId());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setTotalHours(booking.getTotalHours());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStatus(booking.getStatus().name());
        dto.setBookingDate(booking.getBookingDate());
        dto.setConfirmationDeadline(booking.getConfirmationDeadline());
        dto.setNotes(booking.getNotes());
        
        // Get customer details
        User customer = userRepository.findById(booking.getCustomerId()).orElse(null);
        if (customer != null) {
            dto.setCustomerName(customer.getFullName());
            dto.setCustomerEmail(customer.getEmail());
        }
        
        // Get vehicle details
        Vehicle vehicle = vehicleRepository.findById(booking.getVehicleId()).orElse(null);
        if (vehicle != null) {
            dto.setVehicleName(vehicle.getVehicleName());
        }
        
        // Get shop details
        Shop shop = shopRepository.findById(booking.getShopId()).orElse(null);
        if (shop != null) {
            dto.setShopName(shop.getShopName());
        }
        
        // Get payment details (use the latest payment if multiple exist)
        paymentRepository.findByBookingId(booking.getId()).stream().findFirst().ifPresent(payment -> {
            dto.setPaymentStatus(payment.getPaymentStatus().name());
            dto.setPaymentId(payment.getId());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setTransactionId(payment.getTransactionId());
            if (payment.getPaymentDate() != null) {
                dto.setPaymentDate(payment.getPaymentDate().toString());
            }
        });
        
        return dto;
    }
}
