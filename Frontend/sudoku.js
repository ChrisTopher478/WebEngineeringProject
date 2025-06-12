// === Globale Zustände ===
const state = {
    sudokuBoard: [],
    solutionBoard: [],
    activeCell: null,
    isNoteMode: false,
};

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

// === Initialisierung ===
async function initGame() {
    setupEventHandlers();
    await loadSudoku();
    renderBoard();
}

async function loadSudoku() {
    try {
        const response = await fetch('sudoku.json');
        const data = await response.json();

        state.sudokuBoard = data.sudoku.map(row =>
            row.map(cell => ({
                value: cell !== 0 ? cell : null,
                notes: [],
                fixed: cell !== 0,
                invalid: false
            }))
        );

        state.solutionBoard = data.solution;
    } catch (error) {
        console.error("Fehler beim Laden des Sudokus:", error);
    }
}

// === Event-Handling ===
function setupEventHandlers() {
    initNumPadEvents();
    initSidebarEvents();
}

function initNumPadEvents() {
    document.querySelectorAll(".numButton").forEach(button => {
        button.addEventListener("click", () => handleNumPadClick(button));
    });
}

function initSidebarEvents() {
    const openSettingsButton = document.getElementById("openSettings");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    openSettingsButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
}

// === Board zeichnen ===
function renderBoard() {
    const table = document.getElementById("sudoku");
    table.innerHTML = "";

    state.sudokuBoard.forEach((row, rowIndex) => {
        const tr = table.insertRow();
        row.forEach((cellData, colIndex) => {
            const td = tr.insertCell();

            td.classList.toggle("invalid", cellData.invalid);

            const container = document.createElement("div");
            container.classList.add("cellContainer");
            renderCellContent(container, cellData);
            td.appendChild(container);

            applyCellBorders(td, rowIndex, colIndex);
            td.addEventListener("click", () => {
                state.activeCell = { row: rowIndex, col: colIndex };
            });
        });
    });
}

function renderCellContent(container, cellData) {
    container.innerHTML = "";

    if (cellData.fixed) {
        container.textContent = cellData.value;
        container.classList.add("fixed");
    } else if (cellData.value) {
        const valueDiv = document.createElement("div");
        valueDiv.classList.add("cellValue");
        valueDiv.textContent = cellData.value;
        container.appendChild(valueDiv);
    } else if (cellData.notes.length > 0) {
        const notesDiv = document.createElement("div");
        notesDiv.classList.add("notes");

        for (let n = 1; n <= 9; n++) {
            const note = document.createElement("span");
            note.classList.add("note");
            note.textContent = cellData.notes.includes(n) ? n : "";
            notesDiv.appendChild(note);
        }
        container.appendChild(notesDiv);
    }
}

function applyCellBorders(cell, rowIndex, colIndex) {
    const standard = "1px solid #999";
    const thick = "2px solid #000";

    cell.style.borderTop = (rowIndex === 0 || rowIndex % 3 === 0) ? thick : standard;
    cell.style.borderBottom = (rowIndex === 8) ? thick : standard;
    cell.style.borderLeft = (colIndex === 0 || colIndex % 3 === 0) ? thick : standard;
    cell.style.borderRight = (colIndex === 8) ? thick : standard;
}

// === Nummernfeld-Verarbeitung ===
function handleNumPadClick(button) {
    const value = button.dataset.value;

    if (value === "N") {
        state.isNoteMode = !state.isNoteMode;
        button.classList.toggle("active", state.isNoteMode);
        return;
    }

    if (!state.activeCell) return;

    const { row, col } = state.activeCell;
    const cellData = state.sudokuBoard[row][col];

    if (cellData.fixed) return;

    const numValue = parseInt(value);

    if (state.isNoteMode) {
        toggleNote(cellData, numValue);
    } else {
        cellData.value = numValue;
        cellData.notes = [];

        cellData.invalid = state.solutionBoard.length > 0 && numValue !== state.solutionBoard[row][col];
    }

    renderBoard();
}

function toggleNote(cellData, numValue) {
    if (cellData.notes.includes(numValue)) {
        cellData.notes = cellData.notes.filter(n => n !== numValue);
    } else {
        cellData.notes.push(numValue);
        cellData.notes.sort();
    }
}