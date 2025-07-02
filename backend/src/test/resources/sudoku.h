#include <stdbool.h>
#include <time.h>

#ifndef SUDOKU_H
#define SUDOKU_H

#define NO_HIGHSCORE -1

typedef enum {
  EASY,
  MEDIUM,
  HARD,
} Difficulty ;

typedef struct {
  int grid[9][9];
  int initial_grid[9][9];
  Difficulty difficulty;
  time_t elapsed_time;
  time_t best_time[3];
  bool from_save;
  bool won;
} Game;

bool is_cell_valid(int grid[9][9], int cellX, int cellY);
bool is_grid_valid(int grid[9][9]);
int rnd_range(int min, int max);
int find_all_solutions(int grid[9][9], int cellX, int cellY);
bool solve(int grid[9][9], int cellX, int cellY);
bool get_next_free_cell(int grid[9][9], int *cellX, int *cellY);
void generate_grid(int initial_grid[9][9], Difficulty difficulty);
void new_game(Game *game);

#endif // SUDOKU_H
