package com.vehiclerental.service;

import com.vehiclerental.model.Shop;
import com.vehiclerental.repository.ShopRepository;
import com.vehiclerental.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {
    
    @Autowired
    private ShopRepository shopRepository;
    
    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }
    
    public Shop getShopById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + id));
    }
    
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }
    
    public List<Shop> getShopsByOwner(Long ownerId) {
        return shopRepository.findByOwnerId(ownerId);
    }
    
    public List<Shop> getShopsByCity(String city) {
        return shopRepository.findByCity(city);
    }
    
    public Shop updateShop(Long id, Shop shopDetails) {
        Shop shop = getShopById(id);
        shop.setShopName(shopDetails.getShopName());
        shop.setDescription(shopDetails.getDescription());
        shop.setAddress(shopDetails.getAddress());
        shop.setCity(shopDetails.getCity());
        shop.setState(shopDetails.getState());
        shop.setPincode(shopDetails.getPincode());
        shop.setPhone(shopDetails.getPhone());
        shop.setEmail(shopDetails.getEmail());
        return shopRepository.save(shop);
    }
    
    public Shop toggleShopStatus(Long id) {
        Shop shop = getShopById(id);
        shop.setIsActive(!shop.getIsActive());
        return shopRepository.save(shop);
    }
    
    public void deleteShop(Long id) {
        Shop shop = getShopById(id);
        shopRepository.delete(shop);
    }
}
