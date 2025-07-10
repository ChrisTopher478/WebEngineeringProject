package com.sudoku.backend.services;

import com.sudoku.backend.jpa.entities.UserSettings;
import com.sudoku.backend.jpa.repository.UserSettingsRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserSettingsService {
    private final UserSettingsRepository userSettingsRepository;

    public UserSettingsService(UserSettingsRepository userSettingsRepository) {
        this.userSettingsRepository = userSettingsRepository;
    }

    public UserSettings getSettings(String userId) {
        Optional<UserSettings> settings = userSettingsRepository.findByUserId(userId);
        return settings.orElse(null);
    }

    public UserSettings saveSettings(String userId, UserSettings userSettings) {
        Optional<UserSettings> opSettings = userSettingsRepository.findByUserId(userId);
        if (opSettings.isPresent()) {
            UserSettings settings = opSettings.get();
            settings.setAll(userSettings);
            return userSettingsRepository.save(settings);
        }
        userSettings.setUserId(userId);
        return userSettingsRepository.save(userSettings);
    }
}
