// global variables
const cells = [];
let selectedCell = null;
let noteMode = false;
let highlightEnabled = true;
let duplicateCheckEnabled = true;
let currentSolution = [];
const history = [];
const future = [];
let mistakeCheckEnabled = true;
let seconds = 0;
let timerInterval;
let mistakeCount = 0;
let sameNumberHighlightEnabled = true;


// code to run on start

function clearCell(cell) {
  if (!cell || cell.readOnly) return;
  cell.value = '';
  cell.placeholder = '';
  cell.dataset.notes = '';
  checkForAllDuplicates();
  checkAgainstSolution();
  highlightSameNumbers('');
}


function setForCell(cell, value, placeholder, notes){
  if (!cell || cell.readOnly) return;
  
  cell.value = value;
  cell.placeholder = placeholder;
  cell.dataset.notes = notes;
  
  checkForAllDuplicates();
  checkAgainstSolution();
}

function updateMistakeCount() {
  document.getElementById("mistakeCountDisplay").textContent = `❌ Fehler: ${mistakeCount}`;
}

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

function toggleSameNumberHighlight() {
  sameNumberHighlightEnabled = !sameNumberHighlightEnabled;
  const btn = document.getElementById("sameNumberHighlightBtn");
  btn.textContent = `Highlight same numbers: ${sameNumberHighlightEnabled ? 'on' : 'off'}`;

  // Bei Ausschalten Markierung sofort entfernen
  if (!sameNumberHighlightEnabled) {
    cells.forEach(cell => {
      cell.classList.remove('same-number');
      cell.classList.remove('same-note');
    });
  } else if (selectedCell && selectedCell.value) {
    highlightSameNumbers(selectedCell.value);
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
    const container = document.createElement('div');
    container.classList.add('cell'); // Für Layout & Note-Darstellung

    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.inputMode = 'numeric';
    input.maxLength = 1;
    input.pattern = "[1-9]";
    input.id = `cell${i}`;
    input.oninput = () => {
      input.value = input.value.replace(/[^1-9]/g, '');
    };

    const row = Math.floor(i / 9);
    const col = i % 9;
    const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    input.classList.add(`row${row}`);
    input.classList.add(`col${col}`);
    input.classList.add(`block${block}`);

    if (col === 2 || col === 5) input.classList.add('thick-right');
    if (row === 2 || row === 5) input.classList.add('thick-bottom');

    input.addEventListener('focus', () => {
      highlightRelatedCells(i);
      checkForAllDuplicates();
    });

    container.appendChild(input);

    // ⬇️ Notizenraster ergänzen
    const noteGrid = document.createElement('div');
    noteGrid.classList.add('note-grid');
    for (let n = 1; n <= 9; n++) {
      const note = document.createElement('div');
      note.classList.add('note');
      note.dataset.number = n;
      note.textContent = '';
      noteGrid.appendChild(note);
    }
    container.appendChild(noteGrid);

    grid.appendChild(container);
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
  const saveData = {
    timestamp: Date.now(),
    cells: cells.map(cell => ({
      value: cell.value,
      placeholder: cell.placeholder,
      notes: cell.dataset.notes || '',
      readOnly: cell.readOnly
    })),
    timeInSeconds: seconds,
    mistakes: mistakeCount,
    difficulty: getQueryParam('difficulty') || 'easy'
  };

  localStorage.setItem('sudokuSave', JSON.stringify(saveData));
  alert("Spielstand gespeichert!");

  // JSON-Datei erzeugen und herunterladen
  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sudoku_savegame.json";
  a.click();
  URL.revokeObjectURL(url);
  window.location.href = "startingPage.html";
}


function loadSavedGame() {
  const saveData = JSON.parse(localStorage.getItem('sudokuSave'));
  if (!saveData) return;

  saveData.cells.forEach((cellData, idx) => {
    const cell = cells[idx];
    cell.value = cellData.value;
    cell.placeholder = cellData.placeholder;
    cell.dataset.notes = cellData.notes;
    cell.readOnly = cellData.readOnly;
    if (cell.readOnly) {
      cell.classList.add('prefilled');
    }
  });

  seconds = saveData.timeInSeconds || 0;
  mistakeCount = saveData.mistakes || 0;
  updateMistakeCount();
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

    // Neues Highlight: Notizen visuell aktualisieren
    const noteGrid = state.cell.parentElement.querySelector('.note-grid');
    Array.from(noteGrid.children).forEach(div => {
      const digit = div.dataset.number;
      div.textContent = state.notes.includes(digit) ? digit : '';
    });

    checkForAllDuplicates();
    checkAgainstSolution();
  }
}


function highlightRelatedCells(index) {
  if (!highlightEnabled) return;

  // Vorheriges Highlight entfernen
  cells.forEach(cell => cell.classList.remove('highlight'));

  const row = Math.floor(index / 9);
  const col = index % 9;

  // Zeile und Spalte hervorheben
  for (let i = 0; i < 9; i++) {
    cells[row * 9 + i].classList.add('highlight');
    cells[i * 9 + col].classList.add('highlight');
  }

  // 3x3 Block hervorheben
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const blockIndex = (blockRowStart + r) * 9 + (blockColStart + c);
      cells[blockIndex].classList.add('highlight');
    }
  }
}

function highlightSameNumbers(value) {
  // nur wenn eingeschaltet
  if (!sameNumberHighlightEnabled || !value || !/^[1-9]$/.test(value)) return;

  cells.forEach(cell => {
    cell.classList.remove('same-number');
    cell.classList.remove('same-note');

    if (cell.value === value) {
      cell.classList.add('same-number');
    }

    if (cell.dataset.notes && cell.dataset.notes.includes(value)) {
      cell.classList.add('same-note');
    }
  });
}



function checkForAllDuplicates() {
  if (!duplicateCheckEnabled || !selectedCell) return;
  markAllDuplicates();
}

function markAllDuplicates() {
  cells.forEach(cell => cell.classList.remove(`duplicate`))
  Array.from(["row", "col", "block"]).forEach(className => {
    for (i = 0; i < 9; i++) {
      let elements = Array.from(document.getElementsByClassName(`${className}${i}`));
      let numbers = elements.map(cell => cell.value).filter(number => number.length === 1 && parseInt(number) !== 0);
      while (numbers.length > 0) {
        let candidate = numbers.pop();
        if (numbers.includes(candidate)) {
          elements.forEach(element => {
            if(parseInt(element.value) == candidate) {
              element.classList.add(`duplicate`)
            }
          });
          return;
        }
      }
    }
  });
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

function moveSelection(offset) {
  if (!selectedCell) return;

  let index = cells.indexOf(selectedCell);
  let newIndex = index + offset;

  // Sonderfälle vermeiden: z. B. von Spalte 0 nach Spalte 8 bei Linksbewegung
  if (offset === -1 && index % 9 === 0) return;
  if (offset === 1 && index % 9 === 8) return;
  if (newIndex < 0 || newIndex >= 81) return;

  selectedCell = cells[newIndex];
  selectedCell.focus();
}


function insertNumber(number) {
  if (!selectedCell) return;

  saveState(selectedCell);

  const noteGrid = selectedCell.parentElement.querySelector('.note-grid');

  if (noteMode) {
    // Notizmodus aktiv: Nur Notizen pflegen
    let notesSet = new Set((selectedCell.dataset.notes || '').split(''));

    if (notesSet.has(number)) {
      notesSet.delete(number);
    } else {
      notesSet.add(number);
    }

    const updatedNotes = Array.from(notesSet).sort().join('');
    selectedCell.dataset.notes = updatedNotes;

    // Notizen visuell aktualisieren
    Array.from(noteGrid.children).forEach(div => {
      const digit = div.dataset.number;
      div.textContent = updatedNotes.includes(digit) ? digit : '';
    });

    // Zahl immer löschen, wenn Notizmodus
    selectedCell.value = '';

  } else {
    // Eingabemodus aktiv: Nur Zahl setzen
    selectedCell.value = number;
    selectedCell.dataset.notes = '';

    // Notizenanzeige leeren
    Array.from(noteGrid.children).forEach(div => {
      div.textContent = '';
    });

    // Automatisches Entfernen der gleichen Notizen in Zeile, Spalte und Block
    const index = cells.indexOf(selectedCell);
    saveAffectedNotes(index, number); 
    removeNotesForNumber(index, number);


    // Fehlerprüfung bei aktiver Prüfung
    if (mistakeCheckEnabled && currentSolution.length) {
      const idx = cells.indexOf(selectedCell);
      if (parseInt(selectedCell.value) !== currentSolution[idx]) {
        mistakeCount++;
        updateMistakeCount();
      }
    }

    highlightSameNumbers(number);
  }

  checkForAllDuplicates();
  checkAgainstSolution();
}

function removeNotesForNumber(index, number) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;

  const affectedIndices = new Set();

  // Zeile
  for (let c = 0; c < 9; c++) {
    affectedIndices.add(row * 9 + c);
  }

  // Spalte
  for (let r = 0; r < 9; r++) {
    affectedIndices.add(r * 9 + col);
  }

  // Block
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      affectedIndices.add((blockRowStart + r) * 9 + (blockColStart + c));
    }
  }

  affectedIndices.forEach(idx => {
    const cell = cells[idx];
    if (cell.dataset.notes && cell.dataset.notes.includes(number)) {
      // Entferne die Zahl aus den Notizen
      let notesSet = new Set(cell.dataset.notes.split(''));
      notesSet.delete(number);
      const updatedNotes = Array.from(notesSet).sort().join('');
      cell.dataset.notes = updatedNotes;

      // Notizanzeige aktualisieren
      const noteGrid = cell.parentElement.querySelector('.note-grid');
      Array.from(noteGrid.children).forEach(div => {
        const digit = div.dataset.number;
        div.textContent = updatedNotes.includes(digit) ? digit : '';
      });
    }
  });
}

function saveAffectedNotes(index, number) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;

  const affectedIndices = new Set();

  for (let c = 0; c < 9; c++) {
    affectedIndices.add(row * 9 + c);
  }
  for (let r = 0; r < 9; r++) {
    affectedIndices.add(r * 9 + col);
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      affectedIndices.add((blockRowStart + r) * 9 + (blockColStart + c));
    }
  }

  affectedIndices.forEach(idx => {
    const cell = cells[idx];
    history.push({
      cell: cell,
      value: cell.value,
      placeholder: cell.placeholder,
      notes: cell.dataset.notes
    });
  });
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
    document.getElementById("pauseInfo").textContent = `⏱️ Spielzeit: ${mins}:${secs} | 🎨 Offene Felder: ${emptyCells}`;
    document.getElementById("pausePopup").style.display = "flex";
  });

  document.addEventListener('focusin', (e) => {
    if (e.target.matches('#sudokuGrid input') && !e.target.readOnly) {
      selectedCell = e.target;
    }
  });

  document.getElementById("noteToggleButton").addEventListener("click", () => {
    noteMode = !noteMode;
    document.getElementById("noteToggleButton").textContent = noteMode ? "📝 notes on" : "📝 notes off";
  });

  document.addEventListener('keydown', (event) => {
    if (selectedCell && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      insertNumber(event.key);
    }
    if (selectedCell && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      saveState(selectedCell);
      clearCell(selectedCell)
      // selectedCell.value = '';
      // selectedCell.placeholder = '';
      // selectedCell.dataset.notes = '';
      // checkForAllDuplicates();
      // checkAgainstSolution();
    }
    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        moveSelection(-1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        moveSelection(1);
        break;
      case "ArrowUp":
      case "w":
      case "W":
        moveSelection(-9);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        moveSelection(9);
        break;
    }
  });

  document.getElementById("eraseButton").addEventListener("click", () => {
    if (selectedCell && !selectedCell.readOnly) {
      saveState(selectedCell);
      clearCell(selectedCell)
      // selectedCell.value = '';
      // selectedCell.placeholder = '';
      // selectedCell.dataset.notes = '';
      // checkForAllDuplicates();
      // checkAgainstSolution();
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

      // Zelle als ausgewählt markieren
      if (!cell.readOnly) {
        selectedCell = cell;
      }

      // Einheitliches Highlighting über zentrale Funktion
      highlightRelatedCells(i);

      // Neue Funktion: gleiche Zahlen und Notizen lila & fett hervorheben
      if (cell.value) {
        highlightSameNumbers(cell.value);
      } else {
        // Wenn keine Zahl eingegeben ist, alle Markierungen entfernen
        highlightSameNumbers('');
      }
    });
  });
}


