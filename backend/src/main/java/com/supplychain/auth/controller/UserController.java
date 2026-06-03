package com.supplychain.auth.controller;

import com.supplychain.auth.dto.UserDTO;
import com.supplychain.auth.entity.User;
import com.supplychain.auth.repository.UserRepository;
import com.supplychain.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(UserDTO.from(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(@RequestBody UserDTO updateReq, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        user.setFirstName(updateReq.getFirstName());
        user.setLastName(updateReq.getLastName());
        user.setPhone(updateReq.getPhone());
        user.setDepartment(updateReq.getDepartment());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(UserDTO.from(user)));
    }
}
