package com.sudoku.backend.controllers;

import com.sudoku.backend.jpa.entities.ContinueLater;
import com.sudoku.backend.jpa.entities.Sudoku;
import com.sudoku.backend.jpa.repository.ContinueLaterRepository;
import com.sudoku.backend.jpa.repository.SudokuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.swing.text.html.Option;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
//@RequestMapping("sudoku")
public class SudokuController {
    private final SudokuRepository sudokuRepository;
    private final ContinueLaterRepository continueLaterRepository;

    public SudokuController(SudokuRepository sudokuRepository, ContinueLaterRepository continueLaterRepository) {
        this.sudokuRepository = sudokuRepository;
        this.continueLaterRepository = continueLaterRepository;
    }

    private static final Logger LOGGER = Logger.getLogger(SudokuController.class.getName());

    @GetMapping("{difficulty}")
    public ResponseEntity<Sudoku> getSudokuById(@PathVariable int difficulty) {
        // TODO: generate sudokus by difficulty
        return ResponseEntity.of(Optional.of(new Sudoku()));
    }

    @GetMapping("/continue/{userId}")
    public ResponseEntity<Sudoku> getSudokuToContinue(@PathVariable String userId) {
        // TODO: needs to be adapted for multiple sudokus for later
        Optional<ContinueLater> continueLater = continueLaterRepository.findByUserId(userId);
        if (continueLater.isPresent() && continueLater.get().getSudokuId() != null) {
            Optional<Sudoku> sudoku = sudokuRepository.findById(continueLater.get().getSudokuId());
            if (sudoku.isPresent()) {
                return ResponseEntity.of(sudoku);
            } else {
                continueLaterRepository.deleteById(continueLater.get().getId());
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("save/{userId}") // TODO: get userId from token later on
    public ResponseEntity<Sudoku> saveForUser(@RequestBody Sudoku sudoku, @PathVariable String userId) {
        // TODO: needs to be adapted for multiple sudokus for later
        Optional<ContinueLater> optionalContinueLater = continueLaterRepository.findByUserId(userId);
        if (optionalContinueLater.isEmpty()) {
            // TODO: maybe make it transactional
            Sudoku newSudoku = sudokuRepository.save(sudoku);
            continueLaterRepository.save(new ContinueLater(userId, newSudoku.getId()));
            return ResponseEntity.of(Optional.of(newSudoku));
        } else {
            // TODO: maybe make it transactional
            ContinueLater continueLater = optionalContinueLater.get();
            if (continueLater.getSudokuId() != null) {
                sudokuRepository.deleteById(continueLater.getSudokuId());
            }
            Sudoku newSudoku = sudokuRepository.save(sudoku);
            continueLater.setSudokuId(newSudoku.getId());
            continueLaterRepository.save(continueLater);
            return ResponseEntity.of(Optional.of(newSudoku));
        }
    }

    @DeleteMapping("cancel/{userId}") // TODO: get userId from token later on
    public ResponseEntity<Sudoku> cancelSudokuToContinue(@PathVariable String userId) {
        Optional<ContinueLater> continueLater = continueLaterRepository.findByUserId(userId);
        if (continueLater.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Sudoku> sudoku = sudokuRepository.findById(continueLater.get().getSudokuId());
        if (sudoku.isPresent()) {
            sudokuRepository.deleteById(sudoku.get().getId());
            continueLaterRepository.deleteById(continueLater.get().getId());
            return ResponseEntity.of(sudoku);
        }
        continueLaterRepository.deleteById(continueLater.get().getId());
        return ResponseEntity.notFound().build();
    }

    @GetMapping("submissions")
    public ResponseEntity<List<Sudoku>> getAllSubmissions() {
        List<Sudoku> submissions = sudokuRepository.findAllWhereSubmitterIdIsNotNull();
        return ResponseEntity.ok(submissions);
    }

    // TODO: find out how to use keycloak token to identify user
    // even though i can just add it in path bla bla bla
    @PostMapping("submissions/{userId}")
    public ResponseEntity<Sudoku> saveSubmittedSudoku(@RequestBody Sudoku sudoku, @PathVariable String userId) {
        sudoku.setSubmitterId(userId);
        Sudoku submittedSudoku = sudokuRepository.save(sudoku);
        return ResponseEntity.of(Optional.of(submittedSudoku));
    }

    // TODO: find out how to use keycloak token to identify user
    // even though i can just add it in path bla bla bla
    @DeleteMapping("submissions/{submissionId}/{userId}")
    public ResponseEntity<Sudoku> deleteSubmittedSudoku(@PathVariable Integer submissionId, @PathVariable String userId) {
        Optional<Sudoku> submission = sudokuRepository.findByIdAndSubmitterId(submissionId, userId);
        if (submission.isPresent()) {
            sudokuRepository.deleteById(submissionId);
            return ResponseEntity.of(submission);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/protected/premium")
    public ResponseEntity<String> test(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.of(Optional.of("test"));
    }
}
