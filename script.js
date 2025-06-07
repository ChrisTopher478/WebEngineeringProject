// global variables
const cells = [];

let selectedCell = null;
let noteMode = false;
let highlightEnabled = true;
let duplicateCheckEnabled = true;
let currentSolution = []; // NEW
const history = [];
const future = [];
let mistakeCheckEnabled = true;
let seconds = 0;
let timerInterval;



// code to run on start
(function () {
  "use strict";

  var observer = new MutationObserver(function () {
    if (document.body) {
      createPlayfield(cells);
      addInputEventListeners();
      addEventListeners();
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true });
})();

function toggleSettingPopUp() {
  const SettingPopUp = document.getElementById("settingsSettingPopUp");
  SettingPopUp.classList.toggle("open");
}

function toggleTheme() {
  const body = document.body;
  const image = document.getElementById("logo");
  const themeBtn = document.getElementById("themeToggleBtn");

  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    image.src = "blackLogo.png";
    themeBtn.textContent = "🌙 Dark Mode";
  } else {
    image.src = "whiteLogo.png";
    themeBtn.textContent = "🌞 Light Mode";
  }
}

function toggleHighlighting() {
  highlightEnabled = !highlightEnabled;
  const button = document.getElementById("highlightToggleBtn");
  button.textContent = `Backround highlighting: ${highlightEnabled ? 'on' : 'off'}`;
  if (!highlightEnabled) {
    cells.forEach(cell => cell.classList.remove('highlight'));
  }
  if (highlightEnabled && selectedCell) {
    const index = cells.indexOf(selectedCell);
    if (index !== -1) {
      highlightRelatedCells(index);
    }
  }
}

function toggleDuplicateCheck() {
  duplicateCheckEnabled = !duplicateCheckEnabled;
  const button = document.getElementById("duplicateToggleBtn");
  button.textContent = `Check for duplicates: ${duplicateCheckEnabled ? 'on' : 'off'}`;
  if (!duplicateCheckEnabled) {
    cells.forEach(cell => cell.classList.remove('duplicate'));
  } else {
    checkForAllDuplicates();
  }
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function loadPuzzle(difficulty) {
  try {
    const response = await fetch(`${difficulty}.json`);
    const puzzles = await response.json();
    const index = Math.floor(Math.random() * puzzles.length / 2);
    const puzzleEntry = puzzles[index * 2];
    const solutionEntry = puzzles[index * 2 + 1];
    currentSolution = solutionEntry.solution;
    return puzzleEntry.puzzle;
  } catch (err) {
    console.error("Fehler beim Laden des Puzzles:", err);
    return new Array(81).fill(0);
  }
}

function createPlayfield(cells) {
  const grid = document.getElementById('sudokuGrid');
  for (let i = 0; i < 81; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.pattern = "[1-9]";
    input.id = `cell${i}`;
    input.oninput = () => {
      input.value = input.value.replace(/[^1-9]/g, '');
    };
    const row = Math.floor(i / 9);
    const col = i % 9;
    // calculate Box index
    input.classList.add(`row${row}`)
    input.classList.add(`col${col}`)
    // input.classList.add(`box${box}`)
    if (col === 2 || col === 5) input.classList.add('thick-right');
    if (row === 2 || row === 5) input.classList.add('thick-bottom');

    input.addEventListener('focus', () => {
      highlightRelatedCells(i);
      checkForAllDuplicates();
    });

    grid.appendChild(input);
    cells.push(input);
  }
}

function checkAgainstSolution() {
  if (!mistakeCheckEnabled || !currentSolution.length) return;

  cells.forEach((cell, idx) => {
    cell.classList.remove('wrong');
    if (!cell.readOnly && cell.value) {
      const correctValue = currentSolution[idx];
      if (parseInt(cell.value) !== correctValue) {
        cell.classList.add('wrong');
      }
    }
  });
}

function startTimer() {
  const display = document.getElementById("timerDisplay");
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    display.textContent = `⏱️ ${mins}:${secs}`;
  }, 1000);
}

function resumeGame() {
  document.getElementById("pausePopup").style.display = "none";
  startTimer();
}

function exitGame() {
  const confirmed = confirm("Möchtest du das Spiel wirklich verlassen? Der Spielstand wird nicht gespeichert.");
  if (confirmed) {
    window.location.href = "startingPage.html";
  }
}

function saveForLater() {
  alert("Spielstand gespeichert. (Hier könnte z. B. localStorage verwendet werden.)");
}

function saveState(cell) {
  if (!cell || cell.readOnly) return;
  history.push({ cell, value: cell.value, placeholder: cell.placeholder, notes: cell.dataset.notes });
  future.length = 0;
}

function restoreState(stackFrom, stackTo) {
  const state = stackFrom.pop();
  if (state) {
    stackTo.push({ cell: state.cell, value: state.cell.value, placeholder: state.cell.placeholder, notes: state.cell.dataset.notes });
    state.cell.value = state.value;
    state.cell.placeholder = state.placeholder;
    state.cell.dataset.notes = state.notes;
    checkForAllDuplicates();
    checkAgainstSolution();
  }
}

function highlightRelatedCells(index) {
  if (!highlightEnabled) return;
  cells.forEach(cell => cell.classList.remove('highlight'));
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let i = 0; i < 9; i++) {
    cells[row * 9 + i].classList.add('highlight');
    cells[i * 9 + col].classList.add('highlight');
  }
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const blockIndex = (blockRowStart + r) * 9 + (blockColStart + c);
      cells[blockIndex].classList.add('highlight');
    }
  }
}

function checkForAllDuplicates() {
  if (!duplicateCheckEnabled) return;
  cells.forEach(cell => cell.classList.remove('duplicate'));
  checkRows();
  checkColumn();
  checkBlocks();
  // const positionsByValue = {};
  // for (let i = 0; i < 81; i++) {
  //   const val = cells[i].value;
  //   if (!val) continue;
  //   if (!positionsByValue[val]) positionsByValue[val] = [];
  //   positionsByValue[val].push(i);
  // }
  // for (const val in positionsByValue) {
  //   const positions = positionsByValue[val];
  //   for (let i = 0; i < positions.length; i++) {
  //     for (let j = i + 1; j < positions.length; j++) {
  //       const idx1 = positions[i];
  //       const idx2 = positions[j];
  //       const row1 = Math.floor(idx1 / 9);
  //       const col1 = idx1 % 9;
  //       const row2 = Math.floor(idx2 / 9);
  //       const col2 = idx2 % 9;
  //       const sameRow = row1 === row2;
  //       const sameCol = col1 === col2;
  //       const sameBox = Math.floor(row1 / 3) === Math.floor(row2 / 3) && Math.floor(col1 / 3) === Math.floor(col2 / 3);
  //       if (sameRow || sameCol || sameBox) {
  //         cells[idx1].classList.add('duplicate');
  //         cells[idx2].classList.add('duplicate');
  //       }
  //     }
  //   }
  // }
}

function checkRows() {
  for (let i = 0; i > 9; i++) {
    let row = document.getElementsByClassName(`row${i}`)
    // logic to check duplicates
    if (duplicatesFound) {
      highlightRow(i);
    }
  }
}
function checkColumn() {
  for (let i = 0; i > 9; i++) {
    let row = document.getElementsByClassName(`col${i}`)
    // logic to check duplicates
    if (duplicatesFound) {
      highlightColumn(i);
    }
  }
}
function checkBlocks() {
  for (let i = 0; i > 9; i++) {
    let row = document.getElementsByClassName(`block${i}`)
    // logic to check duplicates
    if (duplicatesFound) {
      highlightBlocks(i);
    }
  }
}

function toggleMistakeCheck() {
  mistakeCheckEnabled = !mistakeCheckEnabled;

  const button = document.getElementById("mistakeToggleBtn");
  button.innerHTML = `Check for mistake: ${mistakeCheckEnabled ? 'on' : 'off'}`;

  if (!mistakeCheckEnabled) {
    cells.forEach(cell => cell.classList.remove('wrong'));
  } else {
    checkAgainstSolution();
  }
}

function insertNumber(number) {
  if (!selectedCell) return;
  saveState(selectedCell);
  if (noteMode) {
    if (!selectedCell.dataset.notes) {
      selectedCell.dataset.notes = number;
    } else {
      const notesSet = new Set(selectedCell.dataset.notes.split(''));
      if (notesSet.has(number)) {
        notesSet.delete(number);
      } else {
        notesSet.add(number);
      }
      selectedCell.dataset.notes = Array.from(notesSet).sort().join('');
    }
    selectedCell.value = '';
    selectedCell.placeholder = selectedCell.dataset.notes;
  } else {
    selectedCell.value = number;
    selectedCell.placeholder = '';
    selectedCell.dataset.notes = '';
  }
  checkForAllDuplicates();
  checkAgainstSolution();
}

function addEventListeners() {
  window.addEventListener('load', async () => {
    const difficulty = getQueryParam('difficulty') || 'easy';
    const puzzle = await loadPuzzle(difficulty);
    puzzle.forEach((val, idx) => {
      const cell = cells[idx];
      if (val !== 0) {
        cell.value = val;
        cell.readOnly = true;
        cell.classList.add('prefilled');
      }
    });
    startTimer();
  });

  document.getElementById("pauseButton").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const emptyCells = [...document.querySelectorAll('#sudokuGrid input')].filter(cell => cell.value === '').length;
    document.getElementById("pauseInfo").textContent = `⏱️ Spielzeit: ${mins}:${secs} | 🩹 Offene Felder: ${emptyCells}`;
    document.getElementById("pausePopup").style.display = "flex";
  });

  document.addEventListener('focusin', (e) => {
    if (e.target.matches('#sudokuGrid input') && !e.target.readOnly) {
      selectedCell = e.target;
    }
  });

  document.getElementById("noteToggleButton").addEventListener("click", () => {
    noteMode = !noteMode;
    document.getElementById("noteToggleButton").textContent = noteMode ? "🗑️ notes on" : "🗑️ notes off";
  });

  document.addEventListener('keydown', (event) => {
    if (selectedCell && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      insertNumber(event.key);
    }
    if (selectedCell && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      saveState(selectedCell);
      selectedCell.value = '';
      selectedCell.placeholder = '';
      selectedCell.dataset.notes = '';
      checkForAllDuplicates();
      checkAgainstSolution();
    }
    switch (event.key) {
      case "ArrowLeft":
        // selectedCell to left
        break;
      case "ArrowRight":
        // selectedCell to right
        break;
      case "ArrowUp":
        // selectedCell to up
        break;
      case "ArrowDown":
        // selectedCell to down
        break;
    }
  });

  document.getElementById("eraseButton").addEventListener("click", () => {
    if (selectedCell && !selectedCell.readOnly) {
      saveState(selectedCell);
      selectedCell.value = '';
      selectedCell.placeholder = '';
      selectedCell.dataset.notes = '';
      checkForAllDuplicates();
      checkAgainstSolution();
    }
  });

  document.getElementById("resetButton").addEventListener("click", () => {
    document.querySelectorAll('#sudokuGrid input').forEach((cell, i) => {
      if (!cell.readOnly) {
        saveState(cell);
        cell.value = '';
        cell.placeholder = '';
        cell.dataset.notes = '';
      }
    });
    checkForAllDuplicates();
    checkAgainstSolution();
  });

  document.getElementById("undoButton").addEventListener("click", () => {
    restoreState(history, future);
  });

  document.getElementById("redoButton").addEventListener("click", () => {
    restoreState(future, history);
  });
}

function addInputEventListeners() {
  cells.forEach((cell, i) => {
    cell.classList.remove('highlight');
    cell.addEventListener('click', () => {
      if (!highlightEnabled) return;
      const row = Math.floor(i / 9);
      const col = i % 9;
      for (let j = 0; j < 9; j++) {
        cells[row * 9 + j].classList.add('highlight');
        cells[j * 9 + col].classList.add('highlight');
      }
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const blockIndex = (startRow + r) * 9 + (startCol + c);
          cells[blockIndex].classList.add('highlight');
        }
      }
    });
  });
}
