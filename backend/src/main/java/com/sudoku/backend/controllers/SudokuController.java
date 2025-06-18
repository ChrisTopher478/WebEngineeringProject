package com.sudoku.backend.controllers;

import com.sudoku.backend.jpa.entities.ContinueLater;
import com.sudoku.backend.jpa.entities.Sudoku;
import com.sudoku.backend.jpa.repository.ContinueLaterRepository;
import com.sudoku.backend.jpa.repository.SudokuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.logging.Logger;

@RestController
public class SudokuController {
    private final SudokuRepository sudokuRepository;
    private final ContinueLaterRepository continueLaterRepository;

    public SudokuController(SudokuRepository sudokuRepository, ContinueLaterRepository continueLaterRepository) {
        this.sudokuRepository = sudokuRepository;
        this.continueLaterRepository = continueLaterRepository;
    }

    private static final Logger LOGGER = Logger.getLogger(SudokuController.class.getName());

    @GetMapping("/sudoku/{id}")
    public Optional<Sudoku> getSudoku(@PathVariable int id) {
        Optional<Sudoku> sudoku = sudokuRepository.findById(id);
        if(sudoku.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No Sudoku found for user with id: " + id);
        }
        return sudoku;
    }

    @PostMapping("sudoku/save/{userId}")
    public Sudoku saveForLater(@RequestBody Sudoku sudoku, @PathVariable String userId) {
        Optional<ContinueLater> optionalContinueLater = continueLaterRepository.findByUserId(userId);
        if(optionalContinueLater.isEmpty()) {
            Sudoku newSudoku = sudokuRepository.save(sudoku);
            continueLaterRepository.save(new ContinueLater(userId, newSudoku.getId()));
            return sudokuRepository.save(sudoku);
        }
        else {
            ContinueLater jtUserSudoku = optionalContinueLater.get();
            if(jtUserSudoku.getSudokuId() != null) {
                sudokuRepository.deleteById(jtUserSudoku.getSudokuId());
            }
            Sudoku newSudoku = sudokuRepository.save(sudoku);
            jtUserSudoku.setSudokuId(newSudoku.getId());
            continueLaterRepository.save(jtUserSudoku);
            return newSudoku;
        }
    }

    // TODO find out how to use keycloak token to identify user
    // even though i can just add it in path bla bla bla
    @PostMapping("/sudoku/submission{userId}")
    public Sudoku saveSudoku(@RequestBody Sudoku sudoku, @PathVariable String userId) {
        sudoku.setSubmitterId(userId);
        return sudokuRepository.save(sudoku);
    }
}
