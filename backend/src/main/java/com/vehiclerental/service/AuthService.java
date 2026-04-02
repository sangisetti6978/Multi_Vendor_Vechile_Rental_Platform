package com.vehiclerental.service;

import com.vehiclerental.dto.AuthResponse;
import com.vehiclerental.dto.LoginRequest;
import com.vehiclerental.dto.RegisterRequest;
import com.vehiclerental.model.User;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new AuthResponse(token, user.getEmail(), user.getFullName(), 
                               user.getRole().name(), user.getId());
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setIsVerified(false);
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail());
        
        return new AuthResponse(token, savedUser.getEmail(), savedUser.getFullName(),
                               savedUser.getRole().name(), savedUser.getId());
    }
}
