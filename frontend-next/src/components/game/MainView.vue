<template>
  <header class="heading">
    <div class="logoContainer">
      <img class="logo" src="../../assets/img/blackLogo.png" alt="Sudoku Logo">
    </div>
    <button id="openSettings" type="button" aria-label="Einstellungen öffnen">
      <img src="../../assets/img/settings_colorful.png" alt="Einstellungen">
    </button>
  </header>

  <!-- HAUPTINHALT -->
  <main class="gameContainer">

    <!-- Linke Seitenleiste -->
    <LeftSidebar/>

    <!-- Sudoku-Spielfeld -->
    <SudokuField/>

    <!-- Nummernfeld -->
    <Numpad/>

  </main>

  <!-- OVERLAY -->

  <!-- SIDEBAR EINSTELLUNGEN -->

  <!-- PAUSE POPUP -->

</template>

<script>

import {defineComponent} from "vue";
import SudokuField from "@/components/game/SudokuField.vue";
import LeftSidebar from "@/components/game/LeftSidebar.vue";
import Numpad from "@/components/game/Numpad.vue";

export default defineComponent({
  components: {Numpad, LeftSidebar, SudokuField}
})
</script>

<style>
body {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  height: 100vh;
  background-color: #fff;
}

.heading {
  position: relative;
  width: 100%;
  height: 5.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logoContainer {
  display: flex;
  align-items: center;
}

.logo {
  height: 4.7rem;
}

#openSettings {
  position: absolute;
  right: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
}

#openSettings img {
  height: 1.8rem;
}
</style>
