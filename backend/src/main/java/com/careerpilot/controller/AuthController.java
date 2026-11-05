package com.careerpilot.controller;

import com.careerpilot.dto.ApiDtos.LoginRequest;
import com.careerpilot.dto.ApiDtos.RegisterRequest;
import com.careerpilot.security.JwtService;
import com.careerpilot.service.CareerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final CareerService careerService;
    private final JwtService jwtService;
    public AuthController(CareerService careerService, JwtService jwtService) { this.careerService=careerService; this.jwtService=jwtService; }
    @PostMapping("/register") public Map<String,Object> register(@Valid @RequestBody RegisterRequest request) { return careerService.register(request,jwtService); }
    @PostMapping("/login") public Map<String,Object> login(@Valid @RequestBody LoginRequest request) { return careerService.login(request,jwtService); }
    @GetMapping("/me") public Map<String,Object> me() { return careerService.userSummary(careerService.currentUser()); }
}
