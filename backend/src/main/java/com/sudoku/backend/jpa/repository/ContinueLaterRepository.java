package com.sudoku.backend.jpa.repository;

import com.sudoku.backend.jpa.entities.ContinueLater;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ContinueLaterRepository extends CrudRepository<ContinueLater, Integer> {
    public Optional<ContinueLater> findByUserId(String userId);
}
