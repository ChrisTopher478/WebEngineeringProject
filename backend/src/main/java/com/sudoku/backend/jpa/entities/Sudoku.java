package com.sudoku.backend.jpa.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;

@Entity
@Table(name = "sudoku")
public class Sudoku {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private ArrayList<int[]> sudoku;
    private ArrayList<int[]> solution;
    private int errorCount;
    private long elapsedTime;

    public Sudoku() {}

    public int getId() {
        return id;
    }

    public ArrayList<int[]> getSudoku() {
        return sudoku;
    }

    public void setSudoku(int[][] sudoku) {
        this.sudoku = toArrayList(sudoku);
    }

    public void setSolution(int[][] solution) {
        this.solution = toArrayList(solution);
    }

    public ArrayList<int[]> getSolution() {
        return solution;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public long getElapsedTime() {
        return elapsedTime;
    }

    private ArrayList<int[]> toArrayList(int[][] sudoku) {
        ArrayList<int[]> sudokuList = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            sudokuList.add(sudoku[i]);
        }
        return sudokuList;
    }
}
