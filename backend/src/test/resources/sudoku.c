#include "sudoku.h"
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>

/**
 * Checks if the value of a cell in the sudoku grid does not appear in the same line, row or subgrid.
 * @param grid The sudoku grid.
 * @param cellX The x-coordinate of the cell.
 * @param cellY The y-coordinate of the cell.
 * @return True if the value of the cell does not appear again in the same line, row or subgrid or else false.
 */
bool is_cell_valid(int grid[9][9], int cellX, int cellY) {
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
int rnd_range(int min, int max) {
  return min + rand() % (1 + max - min);
}

/**
 * Checks if the entire sudoku grid is valid according to sudoku rules.
 * @param grid The sudoku grid to validate.
 * @return True if the grid is valid, false otherwise.
 */
bool is_grid_valid(int grid[9][9]) {
  for (int x = 0; x < 9; x++) {
    for (int y = 0; y < 9; y++) {
      if (grid[x][y] == 0 || !is_cell_valid(grid, x, y)) {
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
int find_all_solutions(int grid[9][9], int cellX, int cellY) {
  int value = 1;
  int solutions = 0;

  // Initialize coordinates for the next cell and check for its existance.
  int nextX = cellX;
  int nextY = cellY;
  bool hasNext = get_next_free_cell(grid, &nextX, &nextY);

  // Check for each possible value if the grid is still valid.
  // Then move on to the next cell and repeat.
  // Add the amount of solutions found by the recursive function call.
  while (value <= 9) {
    grid[cellX][cellY] = value;
    if (is_cell_valid(grid, cellX, cellY)) {
      if (!hasNext) {
        solutions++;
      } else {
        solutions += find_all_solutions(grid, nextX, nextY);
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
bool solve(int grid[9][9], int cellX, int cellY) {
  bool valid = false;

  // Initialize coordinates for the next cell and check for its existance.
  int nextX = cellX;
  int nextY = cellY;
  bool hasNext = get_next_free_cell(grid, &nextX, &nextY);

  // Check for each possible value if the grid is still valid
  // then move on to the next cell and repeat.
  srand(time(NULL));
  int startValue = rnd_range(0, 8);
  for (int valueOff = 0; !valid && valueOff < 9; valueOff++) {
    grid[cellX][cellY] = 1 + (startValue + valueOff) % 9;
    valid = is_cell_valid(grid, cellX, cellY) && (!hasNext || solve(grid, nextX, nextY));
  }

  // Reset the cell value if all values have been invalid.
  if (!valid) {
    grid[cellX][cellY] = 0;
  }

  return valid;
}

/**
 * Determines the next cell in the grid which contains the value 0 excluding the cell, which is indicated by cellX and cellY.
 * Returns the coordinates of the cell through cellX and cellY.
 * @param grid The sudoku grid which should be searched through.
 * @param cellX Gets set to the x-coordinate of the next cell if one is found.
 * @param cellY Gets set to the y-coordinate of the next cell if one is found.
 * @return True if a free cell is found of else false.
 */
bool get_next_free_cell(int grid[9][9], int *cellX, int *cellY) {
  for (int yOff = 0; yOff < 9; yOff++) {
    for (int xOff = 0; xOff < 9; xOff++) {
      int x = (*cellX + xOff) % 9;
      int y = (*cellY + yOff) % 9;

      if (grid[x][y] == 0 && !(x == *cellX && y == *cellY)) {
        *cellX = x;
        *cellY = y;
        return true;
      }
    }
  }
  return false;
}

/**
 * Determines the next cell in the grid which does not contain the value 0 excluding the cell, which is indicated by cellX and cellY.
 * Returns the coordinates of the cell through cellX and cellY.
 * @param grid The sudoku grid which should be searched through.
 * @param cellX Gets set to the x-coordinate of the next cell if one is found.
 * @param cellY Gets set to the y-coordinate of the next cell if one is found.
 * @return True if a free cell is found of else false.
 */
bool get_next_filled_cell(int grid[9][9], int *cellX, int *cellY) {
  for (int yOff = 0; yOff < 9; yOff++) {
    for (int xOff = 0; xOff < 9; xOff++) {
      int x = (*cellX + xOff) % 9;
      int y = (*cellY + yOff) % 9;

      if (grid[x][y] != 0 && !(x == *cellX && y == *cellY)) {
        *cellX = x;
        *cellY = y;
        return true;
      }
    }
  }
  return false;
}

/**
 * Fills the initial grid with correct values.
 * Then erases cell values depending on the difficulty parameter while still making sure that there is only one solution to the sudoku grid.
 * @param grid The sudoku grid which will contain the generated values at the end of the function.
 * @param difficulty The difficulty of the puzzle determines how many cells will be erased after generation.
 */
void generate_grid(int grid[9][9], Difficulty difficulty) {
  int startX = rnd_range(0, 8);
  int startY = rnd_range(0, 8);

  // Fill out the whole grid with one solution
  if (solve(grid, startX, startY)) {

    // Repeat this step depending on how high the difficulty is set
    for (int i = 0; i < (int)(((1.0 + (float)difficulty) / 3.0) * 50); i++) {

      int initialX = rnd_range(0, 8);
      int initialY = rnd_range(0, 8);
      get_next_filled_cell(grid, &initialX, &initialY);
      int cellX = initialX;
      int cellY = initialY;
      bool valid = false;

      // Try to erase the value of a filled cell in a way that there can be no multiple solutions
      do {
        int value = grid[cellX][cellY];
        grid[cellX][cellY] = 0;

        // Check if there is only one possible solution
        valid = find_all_solutions(grid, cellX, cellY) == 1;
        valid = true;

        // If there are multiple solutions, revert the value of the cell back.
        if (!valid) {
          grid[cellX][cellY] = value;
        }

      } while (!valid && get_next_filled_cell(grid, &cellX, &cellY) && !(cellX == initialX || cellY == initialY));
    }
  }
}

/**
 * Initializes a new game by generating the grids according to the difficulty.
 * @param game The game struct which should be initialized.
 */
void new_game(Game *game) {
  for (int y = 0; y < 9; y++) {
    for (int x = 0; x < 9; x++) {
      game->initial_grid[x][y] = 0;
      game->grid[x][y] = 0;
    }
  }

  generate_grid(game->initial_grid, game->difficulty);

  for (int y = 0; y < 9; y++) {
    for (int x = 0; x < 9; x++) {
      game->grid[x][y] = game->initial_grid[x][y];
    }
  }
}
