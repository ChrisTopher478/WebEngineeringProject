package com.sudoku.backend.jpa.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "continue_later") // maybe @JoinTable would be useful
public class ContinueLater {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String userId;
    private Integer sudokuId;

    public ContinueLater() {}
    public ContinueLater(String userId, int sudokuId) {
        this.userId = userId;
        this.sudokuId = sudokuId;
    }

    public int getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Integer getSudokuId() {
        return sudokuId;
    }

    public void setSudokuId(Integer sudokuId) {
        this.sudokuId = sudokuId;
    }
}
