package com.sudoku.backend.jpa.entities;

import jakarta.persistence.*;

import java.util.ArrayList;

@Entity
@Table(name = "sudoku")
public class Sudoku {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private ArrayList<Integer> sudoku;
    private ArrayList<Integer> solution;
    private String submitterId = "";

    public Sudoku() {}

    public int getId() {
        return id;
    }

    public ArrayList<Integer> getSudoku() {
        return sudoku;
    }

    public ArrayList<Integer> getSolution() {
        return solution;
    }

    public String getSubmitterId() {
        return submitterId;
    }

    public void setSubmitterId(String submitterId) {
        this.submitterId = submitterId;
    }

    public void setSudoku(int[][] sudoku) {
        ArrayList<Integer> flatSudoku = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                flatSudoku.add(sudoku[i][j]);
            }
        }
        this.sudoku = flatSudoku;
    }

    public void setSolution(int[][] solution) {
        ArrayList<Integer> flatSudoku = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                flatSudoku.add(solution[i][j]);
            }
        }
        this.solution = flatSudoku;
    }
}
