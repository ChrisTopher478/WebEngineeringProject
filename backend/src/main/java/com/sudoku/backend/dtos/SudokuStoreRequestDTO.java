package com.sudoku.backend.dtos;

import java.util.ArrayList;

public record SudokuStoreRequestDTO(
        int userId,
        ArrayList<Integer> sudoku,
        ArrayList<Integer> solution){}
