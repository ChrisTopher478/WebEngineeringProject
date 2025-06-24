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

<style scoped>
.boardWrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

table {
  border-collapse: collapse;
}

td {
  border: 1px solid #999;
  width: 2rem;
  height: 2rem;
  text-align: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

input {
  width: 1.8rem;
  height: 1.8rem;
  font-size: 0.9rem;
  text-align: center;
  border: none;
  padding: 0;
  caret-color: transparent;
}

.fixed {
  /* background-color: var(--highlight-color); */
  font-weight: bold;
}

.bold-border {
  border: 2px solid var(--bold-border-color);
}
</style>
