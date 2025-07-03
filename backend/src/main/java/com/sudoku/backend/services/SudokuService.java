package com.sudoku.backend.services;

import com.sudoku.backend.jpa.entities.Sudoku;
import com.sudoku.backend.models.Cell;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
public class SudokuService {
    public enum Difficulty {
        EASY,
        MEDIUM,
        HARD
    }

    /**
     * Checks if the value of a cell in the sudoku grid does not appear in the same line, row or subgrid.
     * @param grid The sudoku grid.
     * @param cellX The x-coordinate of the cell.
     * @param cellY The y-coordinate of the cell.
     * @return True if the value of the cell does not appear again in the same line, row or subgrid or else false.
     */
    private boolean isCellValid(int[][] grid, int cellX, int cellY) {
        int value = grid[cellX][cellY];

        for (int i = 0; i < 9; i++) {
            if (grid[i][cellY] == value && i != cellX && grid[i][cellY] != 0) {
                return false;
            }
        }

        for (int i = 0; i < 9; i++) {
            if (grid[cellX][i] == value && i != cellY && grid[cellX][i] != 0) {
                return false;
            }
        }

        int squareX = cellX / 3;
        int squareY = cellY / 3;
        for (int xoff = 0; xoff < 3; xoff++) {
            for (int yoff = 0; yoff < 3; yoff++) {
                int x = 3 * squareX + xoff;
                int y = 3 * squareY + yoff;
                if (!(x == cellX && y == cellY) && grid[x][y] == value && grid[x][y] != 0) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Returns a random number in range of min and max (both included).
     */
    private int rndRange(int min, int max) {
//        return min + random() % (1 + max - min);
        return min + (int)(Math.random() * ((max - min) + 1));
    }

    /**
     * Checks if the entire sudoku grid is valid according to sudoku rules.
     * @param grid The sudoku grid to validate.
     * @return True if the grid is valid, false otherwise.
     */
    private boolean isGridValid(int[][] grid) {
        for (int x = 0; x < 9; x++) {
            for (int y = 0; y < 9; y++) {
                if (grid[x][y] == 0 || !isCellValid(grid, x, y)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Tries to find all possible solutions for the sudoku by recursively trying out values to fill the grid without breaking the sudoku rules.
     * @param grid The sudoku grid (WARNING: This value will be modified during the runtime of the function but should be reverted back by the end.)
     * @param cellX The x-coordinate of the cell.
     * @param cellY The y-coordinate of the cell.
     * @return The number of found solutions.
     */
    private int findAllSolutions(int[][] grid, int cellX, int cellY) {
        int value = 1;
        int solutions = 0;

        // Initialize coordinates for the next cell and check for its existance.
        Cell next = getNextFreeCell(grid, cellX, cellY);

        // Check for each possible value if the grid is still valid.
        // Then move on to the next cell and repeat.
        // Add the amount of solutions found by the recursive function call.
        while (value <= 9) {
            grid[cellX][cellY] = value;
            if (isCellValid(grid, cellX, cellY)) {
                if (next == null) {
                    solutions++;
                } else {
                    solutions += findAllSolutions(grid, next.getXCoordinate(), next.getYCoordinate());
                }
            }
            value++;
        }

        // Reset the grid so it returns to its former state
        grid[cellX][cellY] = 0;

        return solutions;
    }

    /**
     * Solves the sudoku grid by recursively trying out values to fill it without breaking the sudoku rules.
     * @param grid The sudoku grid. It will resemble the solved sudoku when the function has ended.
     * @param cellX The x-coordinate of the cell.
     * @param cellY The y-coordinate of the cell.
     * @return The number of found solutions.
     */
    private boolean solve(int[][] grid, int cellX, int cellY) {
        boolean valid = false;

        // Initialize coordinates for the next cell and check for its existance.
        Cell next = getNextFreeCell(grid, cellX, cellY);

        // Check for each possible value if the grid is still valid
        // then move on to the next cell and repeat.
        int startValue = rndRange(0, 8);
        for (int valueOff = 0; !valid && valueOff < 9; valueOff++) {
            grid[cellX][cellY] = 1 + (startValue + valueOff) % 9;
            valid = isCellValid(grid, cellX, cellY) && (next == null || solve(grid, next.getXCoordinate(), next.getYCoordinate()));
        }

        // Reset the cell value if all values have been invalid.
        if (!valid) {
            grid[cellX][cellY] = 0;
        }

        return valid;
    }

    /**
     * Determines the next cell in the grid which contains the value 0 excluding the cell, which is indicated by cellX and cellY.
     * @param grid The sudoku grid which should be searched through.
     * @param cellX Gets set to the x-coordinate of the next cell if one is found.
     * @param cellY Gets set to the y-coordinate of the next cell if one is found.
     * @return A new Cell if a free cell is found or else null.
     */
    private Cell getNextFreeCell(int[][] grid, int cellX, int cellY) {
        for (int yOff = 0; yOff < 9; yOff++) {
            for (int xOff = 0; xOff < 9; xOff++) {
                int x = (cellX + xOff) % 9;
                int y = (cellY + yOff) % 9;

                if (grid[x][y] == 0) {
                    return new Cell(x,y);
                }
            }
        }
        return null;
    }

    /**
     * Determines the next cell in the grid which does not contain the value 0 excluding the cell, which is indicated by cellX and cellY.
     * Returns the coordinates of the cell through cellX and cellY.
     * @param grid The sudoku grid which should be searched through.
     * @param cellX Gets set to the x-coordinate of the next cell if one is found.
     * @param cellY Gets set to the y-coordinate of the next cell if one is found.
     * @return True if a free cell is found of else false.
     */
    private Cell getNextFilledCell(int[][] grid, int cellX, int cellY) {
        for (int yOff = 0; yOff < 9; yOff++) {
            for (int xOff = 0; xOff < 9; xOff++) {
                int x = (cellX + xOff) % 9;
                int y = (cellY + yOff) % 9;

                if (grid[x][y] != 0) {
                    return new Cell(x,y);
                }
            }
        }
        return null;
    }

    /**
     * Fills the initial grid with correct values.
     * Then erases cell values depending on the difficulty parameter while still making sure that there is only one solution to the sudoku grid.
     * @param grid The sudoku grid which will contain the generated values at the end of the function.
     * @param difficulty The difficulty of the puzzle determines how many cells will be erased after generation.
     */
    private void generateGrid(int[][] grid, Difficulty difficulty) {
        int startX = rndRange(0, 8);
        int startY = rndRange(0, 8);

        // Fill out the whole grid with one solution
        if (solve(grid, startX, startY)) {
            // Repeat this step depending on how high the difficulty is set
            for (int i = 0; i < (int)(((1.0 + difficulty.ordinal()) / 3.0) * 50); i++) {

                int initialX = rndRange(0, 8);
                int initialY = rndRange(0, 8);
                Cell next  = getNextFilledCell(grid, initialX, initialY);
                boolean valid;

                do{
                    int value = grid[next.getXCoordinate()][next.getYCoordinate()]; // todo handle possible null pointer exception
                    grid[next.getXCoordinate()][next.getYCoordinate()] = 0;

                    // Check if there is only one possible solution
                    valid = findAllSolutions(grid, next.getXCoordinate(), next.getYCoordinate()) == 1;

                    // If there are multiple solutions, revert the value of the cell back.
                    if (!valid) {
                        grid[next.getXCoordinate()][next.getYCoordinate()] = value;
                    }
                } while(!valid && !(next.getXCoordinate() == initialX || next.getYCoordinate() == initialY));
            }
        }
    }

    private int[][] emptyGrid(int rows, int cols) {
        return new int[rows][cols];
    }
    private int[][] dupe(int[][] grid) {
        int[][] duplicate = emptyGrid(9,9);
        for(int i = 0; i < 9; i++) {
            System.arraycopy(grid[i], 0, duplicate[i], 0, 9);
        }
        return duplicate;
    }

    /**
     * Initializes a new game by generating the grids according to the difficulty.
     */
    public Sudoku newSudoku(Difficulty difficulty) {
        Sudoku newSudoku = new Sudoku();
        int[][] solution = emptyGrid(9, 9);
        solve(solution, rndRange(0,8), rndRange(0,8));
        newSudoku.setSolution(solution);

        int[][] sudoku = dupe(solution);
        generateGrid(sudoku, difficulty);
        newSudoku.setSudoku(sudoku);

        return newSudoku;
    }

}
