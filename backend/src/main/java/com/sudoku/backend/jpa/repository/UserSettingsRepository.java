package com.sudoku.backend.jpa.repository;

import com.sudoku.backend.jpa.entities.UserSettings;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserSettingsRepository extends CrudRepository<UserSettings, Integer> {
    boolean existsByUserId(String userId);
    Optional<UserSettings> findByUserId(String userId);
}
