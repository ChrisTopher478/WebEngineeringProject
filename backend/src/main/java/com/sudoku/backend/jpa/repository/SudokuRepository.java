package com.sudoku.backend.jpa.repository;

import com.sudoku.backend.jpa.entities.Sudoku;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface SudokuRepository extends CrudRepository<Sudoku, Integer> {
    @NativeQuery("SELECT * FROM sudoku WHERE submitterId IS NOT NULL")
    public List<Sudoku> findAllWhereSubmitterIdIsNotNull();
    public Optional<Sudoku> findByIdAndSubmitterId(Integer id, String submitterId);
}
