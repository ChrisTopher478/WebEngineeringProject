// settings
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
// util
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    async function loadPuzzle(difficulty) {
      try {
        const response = await fetch(`${difficulty}.json`);
        const puzzles = await response.json();
        const random = Math.floor(Math.random() * puzzles.length);
        return puzzles[random].puzzle;
      } catch (err) {
        console.error("Fehler beim Laden des Puzzles:", err);
        return new Array(81).fill(0);// ToDo: make error message
      }
    }

    // const grid = document.getElementById('sudokuGrid');
    // const cells = [];

    function getCellIndex(cell) {
  return cells.indexOf(cell);
}

function highlightRelatedCells(index) {
  // Erst alle vorherigen Highlights entfernen
  cells.forEach(cell => cell.classList.remove('highlight'));

  const row = Math.floor(index / 9);
  const col = index % 9;

  // Zeile und Spalte hervorheben
  for (let i = 0; i < 9; i++) {
    cells[row * 9 + i].classList.add('highlight'); // Zeile
    cells[i * 9 + col].classList.add('highlight'); // Spalte
  }

  // 3x3 Block berechnen
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const blockIndex = (blockRowStart + r) * 9 + (blockColStart + c);
      cells[blockIndex].classList.add('highlight');
    }
  }
}

    for (let i = 0; i < 81; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.pattern = "[1-9]";
      input.oninput = () => {
        input.value = input.value.replace(/[^1-9]/g, '');
      };
      const row = Math.floor(i / 9);
      const col = i % 9;
      if (col === 2 || col === 5) input.classList.add('thick-right');
      if (row === 2 || row === 5) input.classList.add('thick-bottom');
      grid.appendChild(input);
      cells.push(input);
    }
    cells.forEach((cell, index) => {
  cell.addEventListener('focus', () => {
    highlightRelatedCells(index);
  });
});

    input.addEventListener('click', () => {
      // Vorherige Highlights entfernen
      cells.forEach(cell => cell.classList.remove('highlight'));

      const row = Math.floor(i / 9);
      const col = i % 9;

      // Zeile und Spalte hervorheben
      for (let j = 0; j < 9; j++) {
        cells[row * 9 + j].classList.add('highlight'); // Zeile
        cells[j * 9 + col].classList.add('highlight'); // Spalte
      }

      // 3x3 Block hervorheben
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const blockIndex = (startRow + r) * 9 + (startCol + c);
          cells[blockIndex].classList.add('highlight');
        }
      }
    });

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

    let seconds = 0;
    let timerInterval;

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

    document.getElementById("pauseButton").addEventListener("click", () => {
      clearInterval(timerInterval);
      timerInterval = null;
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      const emptyCells = [...document.querySelectorAll('#sudokuGrid input')].filter(cell => cell.value === '').length;
      document.getElementById("pauseInfo").textContent = `⏱️ Spielzeit: ${mins}:${secs} | 🩹 Offene Felder: ${emptyCells}`;
      document.getElementById("pausePopup").style.display = "flex";
    });

    let selectedCell = null;
    let noteMode = false;
    const history = [];
    const future = [];

    document.addEventListener('focusin', (e) => {
      if (e.target.matches('#sudokuGrid input') && !e.target.readOnly) {
        selectedCell = e.target;
      }
    });

    document.getElementById("noteToggleButton").addEventListener("click", () => {
      noteMode = !noteMode;
      document.getElementById("noteToggleButton").textContent = noteMode ? "🗑️ notes on" : "🗑️ notes off";
    });

    function saveState(cell) {
      if (!cell || cell.readOnly) return;
      history.push({
        cell,
        value: cell.value,
        placeholder: cell.placeholder,
        notes: cell.dataset.notes
      });
      future.length = 0;
    }

    function restoreState(stackFrom, stackTo) {
      const state = stackFrom.pop();
      if (state) {
        stackTo.push({
          cell: state.cell,
          value: state.cell.value,
          placeholder: state.cell.placeholder,
          notes: state.cell.dataset.notes
        });
        state.cell.value = state.value;
        state.cell.placeholder = state.placeholder;
        state.cell.dataset.notes = state.notes;
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
    }

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
      }
    });

    document.getElementById("eraseButton").addEventListener("click", () => {
      if (selectedCell && !selectedCell.readOnly) {
        saveState(selectedCell);
        selectedCell.value = '';
        selectedCell.placeholder = '';
        selectedCell.dataset.notes = '';
      }
    });

    document.getElementById("resetButton").addEventListener("click", () => {
      document.querySelectorAll('#sudokuGrid input').forEach(cell => {
        if (!cell.readOnly) {
          saveState(cell);
          cell.value = '';
          cell.placeholder = '';
          cell.dataset.notes = '';
        }
      });
    });

    document.getElementById("undoButton").addEventListener("click", () => {
      restoreState(history, future);
    });

    document.getElementById("redoButton").addEventListener("click", () => {
      restoreState(future, history);
    });

