package com.vehiclerental.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vehiclerental.exception.ResourceNotFoundException;
import com.vehiclerental.model.Shop;
import com.vehiclerental.repository.ShopRepository;

@Service
public class ShopService {
    
    @Autowired
    private ShopRepository shopRepository;
    
    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }
    
    @Transactional(readOnly = true)
    public Shop getShopById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<Shop> getShopsByOwner(Long ownerId) {
        return shopRepository.findByOwnerId(ownerId);
    }
    
    @Transactional(readOnly = true)
    public List<Shop> getShopsByCity(String city) {
        return shopRepository.findByCity(city);
    }
    
    public Shop updateShop(Long id, Shop shopDetails) {
        Shop shop = getShopById(id);
        if (shopDetails.getShopName() != null) {
            shop.setShopName(shopDetails.getShopName());
        }
        if (shopDetails.getDescription() != null) {
            shop.setDescription(shopDetails.getDescription());
        }
        if (shopDetails.getAddress() != null) {
            shop.setAddress(shopDetails.getAddress());
        }
        if (shopDetails.getArea() != null) {
            shop.setArea(shopDetails.getArea());
        }
        if (shopDetails.getCity() != null) {
            shop.setCity(shopDetails.getCity());
        }
        if (shopDetails.getState() != null) {
            shop.setState(shopDetails.getState());
        }
        if (shopDetails.getPincode() != null) {
            shop.setPincode(shopDetails.getPincode());
        }
        if (shopDetails.getPhone() != null) {
            shop.setPhone(shopDetails.getPhone());
        }
        if (shopDetails.getEmail() != null) {
            shop.setEmail(shopDetails.getEmail());
        }
        return shopRepository.save(shop);
    }
    
    public Shop toggleShopStatus(Long id) {
        Shop shop = getShopById(id);
        Boolean currentStatus = shop.getIsActive();
        shop.setIsActive(currentStatus == null ? false : !currentStatus);
        return shopRepository.save(shop);
    }
    
    public void deleteShop(Long id) {
        shopRepository.deleteById(id);
    }
}
