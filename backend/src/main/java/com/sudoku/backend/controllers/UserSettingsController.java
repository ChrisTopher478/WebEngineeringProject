package com.sudoku.backend.controllers;

import com.sudoku.backend.jpa.entities.UserSettings;
import com.sudoku.backend.services.UserSettingsService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("settings")
@CrossOrigin(origins = "http://localhost:8081")
public class UserSettingsController {
    private static final Logger log = LogManager.getLogger(UserSettingsController.class);
    private final UserSettingsService service;

    public UserSettingsController(UserSettingsService service) {
        this.service = service;
    }

    @GetMapping("load")
    public ResponseEntity<UserSettings> loadUserSettings(@AuthenticationPrincipal Jwt jwt) {
        try {
            UserSettings settings = service.getSettings(jwt.getSubject());
            if (settings != null) {
                return ResponseEntity.of(Optional.of(settings));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error(e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("save")
    public ResponseEntity<Object> saveUserSettings(@AuthenticationPrincipal Jwt jwt, @RequestBody UserSettings userSettings) {
        try {
            UserSettings settings = service.saveSettings(jwt.getSubject(), userSettings);
            return ResponseEntity.of(Optional.of(settings));
        } catch (Exception e) {
            log.error(e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
