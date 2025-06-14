// === Konstanten ===
const BOARD_SIZE = 9;
const BLOCK_SIZE = 3;

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
        if (this.undoStack.length > 100) this.undoStack.shift();
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
    loadSettings();
    const storedData = localStorage.getItem("sudokuData");
    if (!storedData) {
        alert("Kein Sudoku gefunden. Bitte starte ein Spiel über die Startseite.");
        return;
    }
    
    await loadSudoku();
    setupEventHandlers();
    renderBoard();
    validateBoard();
    setupSettingsListeners();
    restartTimer();
}

// === Timer ===
let timerInterval, startTime;

function restartTimer() {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "00:00";
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById("timer").textContent = `${pad(minutes)}:${pad(seconds)}`;
}

const pad = num => num.toString().padStart(2, '0');

// === Daten laden ===
async function loadSudoku() {
    try {
        const data = JSON.parse(localStorage.getItem("sudokuData"));
        if (!data?.sudoku || !data?.solution) throw new Error("Ungültiges Datenformat");
        state.board = data.sudoku.map(row => row.map(cell => ({
            value: cell || null,
            notes: [],
            fixed: !!cell,
            invalid: false
        })));
        state.solution = data.solution;
    } catch (err) {
        console.error("Fehler beim Laden des Sudoku:", err);
        alert("Fehler beim Laden des Sudokus. Bitte erneut versuchen.");
    }
}

// === Event Handling ===
function setupEventHandlers() {
    document.getElementById("undoButton").addEventListener("click", () => state.undo());
    document.getElementById("redoButton").addEventListener("click", () => state.redo());
    document.getElementById("deleteButton").addEventListener("click", deleteActiveCell);
    document.getElementById("resetButton").addEventListener("click", resetGame);

    document.querySelector(".numPad").addEventListener("click", e => {
        if (e.target.classList.contains("numButton")) handleNumPadClick(e.target);
    });

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
            td.addEventListener("click", () => state.activeCell = { row: rowIndex, col: colIndex });
        });
    });
}

function renderCellContent(td, cell) {
    td.innerHTML = "";
    const container = document.createElement("div");
    container.classList.add("cellContainer");

    if (cell.fixed) renderFixedCell(container, cell);
    else if (cell.value) renderValueCell(container, cell);
    else if (cell.notes.length > 0) renderNotesCell(container, cell);

    td.appendChild(container);
}

function renderFixedCell(container, cell) {
    container.textContent = cell.value;
    container.classList.add("fixed");
}

function renderValueCell(container, cell) {
    const valueDiv = document.createElement("div");
    valueDiv.classList.add("cellValue");
    valueDiv.textContent = cell.value;
    container.appendChild(valueDiv);
}

function renderNotesCell(container, cell) {
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

function applyCellBorders(cell, row, col) {
    const thick = "2px solid #000", thin = "1px solid #999";
    cell.style.borderTop = (row === 0 || row % BLOCK_SIZE === 0) ? thick : thin;
    cell.style.borderLeft = (col === 0 || col % BLOCK_SIZE === 0) ? thick : thin;
    cell.style.borderRight = (col === 8) ? thick : thin;
    cell.style.borderBottom = (row === 8) ? thick : thin;
}

// === Eingabelogik ===
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

    if (state.isNoteMode) toggleNote(cell, numValue);
    else {
        cell.value = numValue;
        cell.notes = [];
        clearNotesForPeers(row, col, numValue);
        const settings = window.getSettings();
        cell.invalid = settings.checkMistakes ? !isValidInput(row, col, numValue) : false;
    }
    renderBoard();
}

function toggleNote(cell, numValue) {
    cell.notes.includes(numValue) ? cell.notes = cell.notes.filter(n => n !== numValue) : cell.notes.push(numValue);
    cell.notes.sort();
}

function clearNotesForPeers(row, col, value) {
    getPeers(row, col).forEach(({ r, c }) => {
        state.board[r][c].notes = state.board[r][c].notes.filter(n => n !== value);
    });
}

function getPeers(row, col) {
    const peers = [];
    for (let c = 0; c < BOARD_SIZE; c++) if (c !== col) peers.push({ r: row, c });
    for (let r = 0; r < BOARD_SIZE; r++) if (r !== row) peers.push({ r, c: col });
    const startRow = getBlockStart(row), startCol = getBlockStart(col);
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
        for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
            if (r !== row || c !== col) peers.push({ r, c });
        }
    }
    return peers;
}

function getBlockStart(index) {
    return Math.floor(index / BLOCK_SIZE) * BLOCK_SIZE;
}

function isValidInput(row, col, value) {
    return value === state.solution[row][col];
}

function validateBoard() {
    const settings = window.getSettings();
    state.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            cell.invalid = (!cell.fixed && cell.value && settings.checkMistakes) ? !isValidInput(rowIndex, colIndex, cell.value) : false;
        });
    });
    renderBoard();
}

window.validateBoard = validateBoard;

function deleteActiveCell() {
    if (!state.activeCell) return;
    const { row, col } = state.activeCell;
    const cell = state.board[row][col];
    if (cell.fixed) return;
    state.saveState();
    Object.assign(cell, { value: null, notes: [], invalid: false });
    renderBoard();
}

function resetGame() {
    state.board.forEach(row => row.forEach(cell => {
        if (!cell.fixed) Object.assign(cell, { value: null, notes: [], invalid: false });
    }));
    renderBoard();
    restartTimer();
}
