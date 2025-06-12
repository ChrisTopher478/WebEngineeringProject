// === Konstanten ===
const BOARD_SIZE = 9;

// === Globale Zustände ===
class SudokuState {
    constructor() {
        this.board = [];
        this.solution = [];
        this.activeCell = null;
        this.isNoteMode = false;
        this.undoStack = [];
        this.redoStack = [];
    }

    saveState() {
        this.undoStack.push(JSON.stringify(this.board));
        this.redoStack = []; 
    }

    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(this.board));
        this.board = JSON.parse(this.undoStack.pop());
        renderBoard();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(this.board));
        this.board = JSON.parse(this.redoStack.pop());
        renderBoard();
    }
}

const state = new SudokuState();

// === Initialisierung ===
document.addEventListener("DOMContentLoaded", () => initGame());

async function initGame() {
    await loadSudoku();
    setupEventHandlers();
    renderBoard();
}

async function loadSudoku() {
    try {
        const response = await fetch("sudoku.json");
        const data = await response.json();

        state.board = data.sudoku.map(row =>
            row.map(cell => ({
                value: cell !== 0 ? cell : null,
                notes: [],
                fixed: cell !== 0,
                invalid: false
            }))
        );
        state.solution = data.solution;
    } catch (err) {
        console.error("Fehler beim Laden des Sudoku:", err);
    }
}

// === Event Handling ===
function setupEventHandlers() {
    // Undo / Redo Buttons
    document.getElementById("undoButton").addEventListener("click", () => state.undo());
    document.getElementById("redoButton").addEventListener("click", () => state.redo());

    // Löschen Button
    document.getElementById("deleteButton").addEventListener("click", () => {
        if (!state.activeCell) return;

        const { row, col } = state.activeCell;
        const cell = state.board[row][col];

        if (cell.fixed) return;  // feste Zellen dürfen nicht gelöscht werden

        state.saveState();

        cell.value = null;
        cell.notes = [];
        cell.invalid = false;

        renderBoard();
    });

    // Nummernfeld (NumPad)
    document.querySelector(".numPad").addEventListener("click", e => {
        if (e.target.classList.contains("numButton")) {
            handleNumPadClick(e.target);
        }
    });

    // Sidebar öffnen & schließen
    const openSettingsButton = document.getElementById("openSettings");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    openSettingsButton.addEventListener("click", () => toggleSidebar(true));
    overlay.addEventListener("click", () => toggleSidebar(false));
}

function toggleSidebar(open) {
    document.getElementById("sidebar").classList.toggle("open", open);
    document.getElementById("overlay").classList.toggle("active", open);
}

// === Board Rendering ===
function renderBoard() {
    const table = document.getElementById("sudoku");
    table.innerHTML = "";

    state.board.forEach((row, rowIndex) => {
        const tr = table.insertRow();
        row.forEach((cell, colIndex) => {
            const td = tr.insertCell();
            td.classList.toggle("invalid", cell.invalid);
            renderCellContent(td, cell);
            applyCellBorders(td, rowIndex, colIndex);
            td.addEventListener("click", () => {
                state.activeCell = { row: rowIndex, col: colIndex };
            });
        });
    });
}

function renderCellContent(td, cell) {
    td.innerHTML = "";
    const container = document.createElement("div");
    container.classList.add("cellContainer");

    if (cell.fixed) {
        container.textContent = cell.value;
        container.classList.add("fixed");
    } else if (cell.value) {
        const valueDiv = document.createElement("div");
        valueDiv.classList.add("cellValue");
        valueDiv.textContent = cell.value;
        container.appendChild(valueDiv);
    } else if (cell.notes.length > 0) {
        const notesDiv = document.createElement("div");
        notesDiv.classList.add("notes");
        for (let n = 1; n <= BOARD_SIZE; n++) {
            const note = document.createElement("span");
            note.classList.add("note");
            note.textContent = cell.notes.includes(n) ? n : "";
            notesDiv.appendChild(note);
        }
        container.appendChild(notesDiv);
    }

    td.appendChild(container);
}

function applyCellBorders(cell, rowIndex, colIndex) {
    const thick = "2px solid #000";
    const thin = "1px solid #999";

    cell.style.borderTop = (rowIndex === 0 || rowIndex % 3 === 0) ? thick : thin;
    cell.style.borderLeft = (colIndex === 0 || colIndex % 3 === 0) ? thick : thin;
    cell.style.borderRight = (colIndex === 8) ? thick : thin;
    cell.style.borderBottom = (rowIndex === 8) ? thick : thin;
}

// === Logik für Eingaben ===
function handleNumPadClick(button) {
    const value = button.dataset.value;

    if (value === "N") {
        state.isNoteMode = !state.isNoteMode;
        button.classList.toggle("active", state.isNoteMode);
        return;
    }

    if (!state.activeCell) return;

    const { row, col } = state.activeCell;
    const cell = state.board[row][col];

    if (cell.fixed) return;

    const numValue = parseInt(value);
    state.saveState();

    if (state.isNoteMode) {
        toggleNote(cell, numValue);
    } else {
        cell.value = numValue;
        cell.notes = [];
        cell.invalid = !isValidInput(row, col, numValue);
    }

    renderBoard();
}

function toggleNote(cell, numValue) {
    if (cell.notes.includes(numValue)) {
        cell.notes = cell.notes.filter(n => n !== numValue);
    } else {
        cell.notes.push(numValue);
        cell.notes.sort();
    }
}

function isValidInput(row, col, value) {
    return value === state.solution[row][col];
}
