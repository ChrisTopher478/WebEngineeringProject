package com.sudoku.backend.controllers;

import com.sudoku.backend.jpa.entities.Sudoku;
import com.sudoku.backend.services.SudokuService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("sudoku")
@CrossOrigin(origins = "http://localhost:8081")
public class SudokuController {
    private static final Logger log = LogManager.getLogger(SudokuController.class);
    private final SudokuService service;

    public SudokuController(SudokuService service) {
        this.service = service;
    }

    @GetMapping("/generate/{difficulty}")
    public ResponseEntity<Sudoku> getSudokuById(@PathVariable String difficulty) {
        try {
            return ResponseEntity.of(Optional.of(service.generateByDifficulty(difficulty)));
        }
        catch (Exception e) {
            log.error(e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("continue")
    public ResponseEntity<Sudoku> getSudokuToContinue(@AuthenticationPrincipal Jwt jwt) {
        Sudoku sudoku = service.getSudokuToContinue(jwt.getSubject());
        if(sudoku != null) {
            return ResponseEntity.of(Optional.of(sudoku));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("save")
    public ResponseEntity<Sudoku> saveForUser(@AuthenticationPrincipal Jwt jwt, @RequestBody Sudoku sudoku) {
        try {
            Sudoku savedSudoku = service.saveForUser(jwt.getSubject(), sudoku);
            return ResponseEntity.of(Optional.of(savedSudoku));
        } catch (Exception e) {
            log.error(e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("cancel")
    public ResponseEntity<Sudoku> cancelSudokuToContinue(@AuthenticationPrincipal Jwt jwt) {
        Sudoku sudoku = service.cancelSudokuToContinue(jwt.getSubject());
        if(sudoku != null) {
            return ResponseEntity.of(Optional.of(sudoku));
        }
        return ResponseEntity.notFound().build();
    }
}
