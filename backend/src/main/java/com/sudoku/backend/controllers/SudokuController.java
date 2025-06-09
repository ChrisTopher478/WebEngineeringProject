package com.sudoku.backend.controllers;

import com.sudoku.backend.dtos.SudokuStoreRequestDTO;
import org.springframework.javapoet.ClassName;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
public class SudokuController {
    private static final Logger LOGGER = Logger.getLogger(SudokuController.class.getName());

    @PostMapping(value = "/store")
    public void store(@RequestBody SudokuStoreRequestDTO dto) {
        LOGGER.info(dto.toString());
    }
}
