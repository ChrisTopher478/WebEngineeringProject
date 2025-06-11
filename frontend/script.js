function createPlayfield() {
  const grid = document.getElementById("sudoku");
  for (let i = 0; i < 81; i++) {
    // create input cell
    const cell = document.createElement("input");
    cell.type = "text";
    cell.maxLength = 1;
    cell.pattern = "[1-9]";
    cell.id = `cell${i}`;
    cell.oninput = () => {
      cell.value = cell.value.replace(/[^1-9]/g, "");
    };

    const row = Math.floor(i / 9);
    const col = i % 9;
    const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    cell.classList.add(`row${row}`);
    cell.classList.add(`col${col}`);
    cell.classList.add(`block${block}`);

    // if (col === 2 || col === 5) input.classList.add("thick-right");
    // if (row === 2 || row === 5) input.classList.add("thick-bottom");

    cell.addEventListener("focus", () => {
      // highlightRelatedCells(i);
      // checkForAllDuplicates();
    });

    // ⬇️ Notizenraster ergänzen
    const noteGrid = document.createElement("div");
    noteGrid.classList.add("note-grid");
    for (let n = 1; n <= 9; n++) {
      const note = document.createElement("div");
      note.classList.add("note");
      note.dataset.number = n;
      note.textContent = "";
      noteGrid.appendChild(note);
    }

    // create note and input container
    const container = document.createElement("div");
    container.classList.add("cellContainer");
    container.appendChild(cell);
    container.appendChild(noteGrid);

    grid.appendChild(container);
    // cells.push(cell);
  }
}

window.onload = createPlayfield;
