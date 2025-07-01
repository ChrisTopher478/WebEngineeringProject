package com.sudoku.backend.jpa.repository;

import com.sudoku.backend.jpa.entities.Sudoku;
import org.springframework.data.repository.CrudRepository;

public interface SudokuRepository extends CrudRepository<Sudoku, Integer> {
}
