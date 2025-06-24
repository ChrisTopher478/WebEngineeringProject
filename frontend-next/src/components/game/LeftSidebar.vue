<template>
  <nav class="leftSideButtons" aria-label="Seitliche Buttons">
    <div class="splitButtons">
      <button id="undoButton" class="leftSideButtonSmall" type="button">
        <img src="../../assets/img/undo.png" alt="Undo" style="width: 100%">
      </button>
      <button id="redoButton" class="leftSideButtonSmall" type="button">
        <img src="../../assets/img/redo.png" alt="Redo" style="width: 100%">
      </button>
    </div>
    <button id="deleteButton" class="leftSideButton" type="button">Delete</button>
    <button id="resetButton" class="leftSideButton" type="button">Reset</button>
    <button id="pauseButton" class="leftSideButton" type="button">Pause</button>
  </nav>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "LeftSidebar"
})
</script>

<style scoped>
.leftSideButtons {
  position: absolute;
  left: 50%;
  top: calc(50% - (2rem * 9 / 2));
  transform: translateX(calc(-9 * 2rem / 2 - 5rem - 1rem));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leftSideButton, .leftSideButtonSmall {
  font-size: 0.9rem;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #999;
  transition: background-color 0.3s;
}

.leftSideButton {
  width: 5rem;
  height: 2rem;
}

.leftSideButtonSmall {
  width: calc((5rem - 0.2rem) / 2);
  height: 2rem;
}

.leftSideButton:hover, .leftSideButtonSmall:hover {
  background-color: #ddd;
}

.splitButtons {
  display: flex;
  width: 5rem;
  gap: 0.2rem;
}
</style>
