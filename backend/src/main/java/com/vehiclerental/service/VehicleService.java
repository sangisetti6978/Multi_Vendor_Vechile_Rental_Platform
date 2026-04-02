package com.vehiclerental.service;

import com.vehiclerental.dto.SearchRequest;
import com.vehiclerental.dto.VehicleDTO;
import com.vehiclerental.model.Shop;
import com.vehiclerental.model.Vehicle;
import com.vehiclerental.model.User;
import com.vehiclerental.repository.ShopRepository;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.repository.VehicleRepository;
import com.vehiclerental.repository.ReviewRepository;
import com.vehiclerental.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private ShopRepository shopRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }
    
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }
    
    public VehicleDTO getVehicleDTOById(Long id) {
        Vehicle vehicle = getVehicleById(id);
        return convertToDTO(vehicle);
    }
    
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<VehicleDTO> getVehiclesByShop(Long shopId) {
        return vehicleRepository.findByShopId(shopId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<VehicleDTO> searchVehicles(SearchRequest request) {
        String state = (request.getState() != null && !request.getState().isEmpty()) ? request.getState() : null;
        String city = (request.getCity() != null && !request.getCity().isEmpty()) ? request.getCity() : null;
        String area = (request.getArea() != null && !request.getArea().isEmpty()) ? request.getArea() : null;
        Vehicle.VehicleType type = (request.getVehicleType() != null && !request.getVehicleType().isEmpty()) ?
                Vehicle.VehicleType.valueOf(request.getVehicleType().toUpperCase()) : null;

        List<Vehicle> vehicles = vehicleRepository.advancedSearch(
                state, city, area, type, request.getMinPrice(), request.getMaxPrice()
        );

        return vehicles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setVehicleName(vehicleDetails.getVehicleName());
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setRegistrationNumber(vehicleDetails.getRegistrationNumber());
        vehicle.setFuelType(vehicleDetails.getFuelType());
        vehicle.setTransmission(vehicleDetails.getTransmission());
        vehicle.setSeatingCapacity(vehicleDetails.getSeatingCapacity());
        vehicle.setPricePerDay(vehicleDetails.getPricePerDay());
        vehicle.setDescription(vehicleDetails.getDescription());
        vehicle.setImageUrl(vehicleDetails.getImageUrl());
        return vehicleRepository.save(vehicle);
    }
    
    public Vehicle updateVehicleAvailability(Long id, Boolean isAvailable) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setIsAvailable(isAvailable);
        return vehicleRepository.save(vehicle);
    }
    
    public Vehicle toggleVehicleStatus(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setIsActive(!vehicle.getIsActive());
        return vehicleRepository.save(vehicle);
    }
    
    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.delete(vehicle);
    }
    
    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setShopId(vehicle.getShopId());
        dto.setVehicleName(vehicle.getVehicleName());
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getModel());
        dto.setVehicleType(vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null);
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setFuelType(vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null);
        dto.setTransmission(vehicle.getTransmission() != null ? vehicle.getTransmission().name() : null);
        dto.setSeatingCapacity(vehicle.getSeatingCapacity());
        dto.setPricePerDay(vehicle.getPricePerDay());
        dto.setDescription(vehicle.getDescription());
        dto.setImageUrl(vehicle.getImageUrl());
        dto.setIsAvailable(vehicle.getIsAvailable());
        dto.setIsActive(vehicle.getIsActive());
        
        // Get shop details
        Shop shop = shopRepository.findById(vehicle.getShopId()).orElse(null);
        if (shop != null) {
            dto.setShopName(shop.getShopName());
            dto.setCity(shop.getCity());
            dto.setState(shop.getState());
            dto.setArea(shop.getArea());
            dto.setAddress(shop.getAddress());
            
            // Get owner details (phone number)
            User owner = userRepository.findById(shop.getOwnerId()).orElse(null);
            if (owner != null) {
                dto.setOwnerPhone(owner.getPhone());
                dto.setOwnerName(owner.getFullName());
            }
        }
        
        // Get average rating
        Double avgRating = reviewRepository.findAverageRatingByVehicle(vehicle.getId());
        dto.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        return dto;
    }
}
