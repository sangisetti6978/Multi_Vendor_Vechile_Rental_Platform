package com.vehiclerental.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vehiclerental.exception.ResourceNotFoundException;
import com.vehiclerental.model.Review;
import com.vehiclerental.repository.ReviewRepository;

@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    public Review createReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        return reviewRepository.save(review);
    }
    
    @Transactional(readOnly = true)
    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<Review> getReviewsByVehicle(Long vehicleId) {
        return reviewRepository.findByVehicleId(vehicleId);
    }
    
    @Transactional(readOnly = true)
    public List<Review> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }
    
    @Transactional(readOnly = true)
    public Double getAverageRating(Long vehicleId) {
        Double avg = reviewRepository.findAverageRatingByVehicle(vehicleId);
        return avg != null ? avg : 0.0;
    }
    
    public void deleteReview(Long id) {
        Review review = getReviewById(id);
        reviewRepository.delete(review);
    }
}
