<template>
  <div id="pausePopup" class="popup">
    <div class="popupContent">
      <h2>Pause</h2>
      <div id="pauseStatusContainer" class="pause-status">
        <p id="pauseTimerDisplay" class="pause-timer">00:00</p>
        <p id="pauseErrorDisplay" class="pause-error">Mistakes: 0/3</p>
      </div>
      <button id="resumeButton" class="popupButton">Continue</button>
      <button id="exitButton" class="popupButton">Exit Game</button>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "PausePopup"
})
</script>

<style scoped>

</style>
