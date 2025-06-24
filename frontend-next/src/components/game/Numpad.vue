<template>
  <aside class="numPad" aria-label="Nummernfeld">
    <button class="numButton" data-value="N" type="button">
      <img src="../../assets/img/write.png" alt="Note" style="height: 90%">
    </button>
    <button class="numButton" data-value="1" type="button">1</button>
    <button class="numButton" data-value="2" type="button">2</button>
    <button class="numButton" data-value="3" type="button">3</button>
    <button class="numButton" data-value="4" type="button">4</button>
    <button class="numButton" data-value="5" type="button">5</button>
    <button class="numButton" data-value="6" type="button">6</button>
    <button class="numButton" data-value="7" type="button">7</button>
    <button class="numButton" data-value="8" type="button">8</button>
    <button class="numButton" data-value="9" type="button">9</button>
  </aside>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Numpad"
})
</script>

<style scoped>
.numPad {
  position: absolute;
  left: 50%;
  transform: translateX(calc(9 * 2rem / 2 + 1rem));
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  height: calc(2rem * 9);
}

.numButton {
  width: 2.5rem;
  height: 1.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  background-color: #f0f0f0;
  border: 1px solid #999;
  transition: background-color 0.3s;
}

.numButton:hover {
  background-color: #ddd;
}

.numButton.active {
  background-color: lightblue;
}
</style>
