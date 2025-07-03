package com.sudoku.backend.jpa.entities;

import jakarta.persistence.*;

import java.lang.reflect.Array;
import java.util.ArrayList;

@Entity
@Table(name = "sudoku")
public class Sudoku {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private ArrayList<int[]> sudoku;
    private ArrayList<int[]> solution;
    private String submitterId = "";

    public Sudoku() {}

    public int getId() {
        return id;
    }

    public ArrayList<int[]> getSudoku() {
        return sudoku;
    }

    public ArrayList<int[]> getSolution() {
        return solution;
    }

    public String getSubmitterId() {
        return submitterId;
    }

    public void setSubmitterId(String submitterId) {
        this.submitterId = submitterId;
    }

    public void setSudoku(int[][] sudoku) {
        this.sudoku = toArrayList(sudoku);
    }

    public void setSolution(int[][] solution) {
        this.solution = toArrayList(solution);
    }

    private ArrayList<int[]> toArrayList(int[][] sudoku) {
        ArrayList<int[]> sudokuList = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            sudokuList.add(sudoku[i]);
        }
        return sudokuList;
    }
}
