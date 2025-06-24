<template>
  <div>
    <div id="timerContainer">
      <span id="timer">00:00</span>
      <span id="errorCounter" class="error-counter">Mistakes: 0/3</span>
    </div>

    <section class="boardWrapper">
      <table id="sudoku" aria-label="Sudoku Spielfeld">
        <tr v-for="row in field">
          <td v-for="value in row">{{ value }}</td>
        </tr>
      </table>
    </section>
  </div>
</template>

<script setup>
import './styles.css';
const field = [
  [0, 0, 3, 0, 2, 0, 6, 0, 0],
  [9, 0, 0, 3, 0, 5, 0, 0, 1],
  [0, 0, 1, 8, 0, 6, 4, 0, 0],
  [0, 0, 8, 1, 0, 2, 9, 0, 0],
  [7, 0, 0, 0, 0, 0, 0, 0, 8],
  [0, 0, 6, 7, 0, 8, 2, 0, 0],
  [0, 0, 2, 6, 0, 9, 5, 0, 0],
  [8, 0, 0, 2, 0, 3, 0, 0, 9],
  [0, 0, 5, 0, 1, 0, 3, 0, 0]
];
</script>
