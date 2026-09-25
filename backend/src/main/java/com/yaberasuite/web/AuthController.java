package com.yaberasuite.web;

import com.yaberasuite.config.YaberaProperties;
import com.yaberasuite.dto.LoginRequest;
import com.yaberasuite.dto.LoginResponse;
import com.yaberasuite.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final YaberaProperties properties;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(YaberaProperties properties, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.properties = properties;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String expectedUser = properties.getAdmin().getUsername();
        String expectedPassword = properties.getAdmin().getPassword();
        boolean userOk = expectedUser.equals(request.username());
        boolean passwordOk = expectedPassword.equals(request.password())
                || (expectedPassword.startsWith("$2") && passwordEncoder.matches(request.password(), expectedPassword));
        if (!userOk || !passwordOk) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials.");
        }
        return new LoginResponse(jwtService.createToken(expectedUser), expectedUser, "ADMIN");
    }

    @GetMapping("/me")
    public LoginResponse me() {
        String username = properties.getAdmin().getUsername();
        return new LoginResponse(null, username, "ADMIN");
    }
}
