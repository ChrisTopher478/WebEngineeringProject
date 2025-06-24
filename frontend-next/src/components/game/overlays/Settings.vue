<template>
<h2>Settings</h2>
  <div class="toggleContainer">
    <label class="toggleSwitch">
      <p>Dark mode</p>
      <input type="checkbox" id="toggle1">
      <span class="slider"></span>
    </label>

    <label class="toggleSwitch">
      <p>Check for mistakes</p>
      <input type="checkbox" id="toggle2">
      <span class="slider"></span>
    </label>

    <label class="toggleSwitch">
      <p>Check for duplicates</p>
      <input type="checkbox" id="toggle3">
      <span class="slider"></span>
    </label>

    <label class="toggleSwitch">
      <p>Highlight same numbers</p>
      <input type="checkbox" id="toggle4">
      <span class="slider"></span>
    </label>

    <label class="toggleSwitch">
      <p>Backround highlighting</p>
      <input type="checkbox" id="toggle5">
      <span class="slider"></span>
    </label>
  </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Settings"
})
</script>

<style scoped>

</style>
