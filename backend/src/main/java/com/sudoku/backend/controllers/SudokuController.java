package com.sudoku.backend.controllers;

import com.sudoku.backend.jpa.entities.ContinueLater;
import com.sudoku.backend.jpa.entities.Sudoku;
import com.sudoku.backend.jpa.repository.ContinueLaterRepository;
import com.sudoku.backend.jpa.repository.SudokuRepository;
import com.sudoku.backend.services.SudokuService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("sudoku")
public class SudokuController {
    private final SudokuRepository sudokuRepository;
    private final ContinueLaterRepository continueLaterRepository;
    private final SudokuService service;

    public SudokuController(SudokuRepository sudokuRepository, ContinueLaterRepository continueLaterRepository, SudokuService service) {
        this.sudokuRepository = sudokuRepository;
        this.continueLaterRepository = continueLaterRepository;
        this.service = service;
    }

    @GetMapping("/generate/{difficulty}")
    public ResponseEntity<Sudoku> getSudokuById(@PathVariable String difficulty) {
        try {
            SudokuService.Difficulty diff = SudokuService.Difficulty.valueOf(difficulty);
            Sudoku newSudoku = service.newSudoku(diff);
            return ResponseEntity.of(Optional.of(newSudoku));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("continue")
    public ResponseEntity<Sudoku> getSudokuToContinue(@AuthenticationPrincipal Jwt jwt) {
        // TODO: needs to be adapted for multiple sudokus for later
        Optional<ContinueLater> continueLater = continueLaterRepository.findByUserId(jwt.getSubject());
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

    @PostMapping("save")
    public ResponseEntity<Sudoku> saveForUser(@AuthenticationPrincipal Jwt jwt, @RequestBody Sudoku sudoku) {
        // TODO: needs to be adapted for multiple sudokus for later
        Optional<ContinueLater> optionalContinueLater = continueLaterRepository.findByUserId(jwt.getSubject());
        if (optionalContinueLater.isEmpty()) {
            // TODO: maybe make it transactional
            Sudoku newSudoku = sudokuRepository.save(sudoku);
            continueLaterRepository.save(new ContinueLater(jwt.getSubject(), newSudoku.getId()));
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

    @DeleteMapping("cancel")
    public ResponseEntity<Sudoku> cancelSudokuToContinue(@AuthenticationPrincipal Jwt jwt) {
        Optional<ContinueLater> continueLater = continueLaterRepository.findByUserId(jwt.getSubject());
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

    @PostMapping("submission")
    public ResponseEntity<Sudoku> saveSubmittedSudoku(@AuthenticationPrincipal Jwt jwt, @RequestBody Sudoku sudoku) {
//        if(sudoku has solution) {
//            // check if solution correct and matches the sudoku
//            if (solution correct) {
//                // store submission
//                // return stored submission
//            }
//            else {
//                // reject submission
//                // return sent submission and errors
//            }
//        }
//        else {
//            // solve sudoku yourself
//            // store sudoku
//            // return stored sudoku
//        }
        sudoku.setSubmitterId(jwt.getSubject());
        Sudoku submittedSudoku = sudokuRepository.save(sudoku);
        return ResponseEntity.of(Optional.of(submittedSudoku));
    }

    @DeleteMapping("submission/{submissionId}")
    public ResponseEntity<Sudoku> deleteSubmittedSudoku(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer submissionId) {
        Optional<Sudoku> submission = sudokuRepository.findByIdAndSubmitterId(submissionId, jwt.getSubject());
        if (submission.isPresent() && submission.get().getSubmitterId().equals(jwt.getSubject())) {
            sudokuRepository.deleteById(submissionId);
            return ResponseEntity.of(submission);
        }
        return ResponseEntity.notFound().build();
    }
}
