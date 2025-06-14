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

    save() {
        this.undoStack.push(this.snapshot());
        if (this.undoStack.length > 100) this.undoStack.shift();
        this.redoStack = [];
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.board));
    }

    restore(snapshot) {
        this.board = JSON.parse(JSON.stringify(snapshot));
        checkConflicts();
        renderBoard();
    }

    undo() {
        if (!this.undoStack.length) return;
        this.redoStack.push(this.snapshot());
        this.restore(this.undoStack.pop());
    }

    redo() {
        if (!this.redoStack.length) return;
        this.undoStack.push(this.snapshot());
        this.restore(this.redoStack.pop());
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
    checkConflicts();
    renderBoard();
    validateBoard();
    restartTimer();
}

// === Sudoku Daten laden ===
async function loadSudoku() {
    try {
        const data = JSON.parse(localStorage.getItem("sudokuData"));
        if (!data?.sudoku || !data?.solution) throw new Error("Ungültiges Datenformat");
        state.board = data.sudoku.map(row => row.map(cell => ({
            value: cell || null,
            notes: [],
            fixed: !!cell,
            invalid: false,
            conflict: { row: false, col: false, block: false }
        })));
        state.solution = data.solution;
    } catch (err) {
        console.error("Fehler beim Laden des Sudoku:", err);
        alert("Fehler beim Laden des Sudokus. Bitte erneut versuchen.");
    }
}

// === Rendering ===
function renderBoard() {
    const table = document.getElementById("sudoku");
    table.innerHTML = state.board.map((row, r) =>
        `<tr>${row.map((cell, c) => renderCell(cell, r, c)).join("")}</tr>`
    ).join("");
    highlightSameNumbers();  
    highlightPeers();  // <-- hier neu hinzufügen
}

window.renderBoard = renderBoard;

function renderCell(cell, r, c) {
    const classes = [
        cell.fixed ? "fixed" : "",
        cell.invalid ? "invalid" : "",
        cell.conflict.row ? "conflict-row" : "",
        cell.conflict.col ? "conflict-col" : "",
        cell.conflict.block ? "conflict-block" : ""
    ].filter(Boolean).join(" ");
    
    const content = cell.value ? 
        `<div class="cellValue">${cell.value}</div>` :
        renderNotes(cell.notes);
    
    return `<td class="${classes}" data-row="${r}" data-col="${c}">
                <div class="cellContainer">${content}</div>
            </td>`;
}

function renderNotes(notes) {
    if (!notes.length) return "";

    let activeValue = null;
    if (state.activeCell) {
        const { row, col } = state.activeCell;
        activeValue = state.board[row][col].value;
    }

    return `<div class="notes">${[...Array(9)].map((_, i) => {
        const noteValue = i + 1;
        const isActive = activeValue === noteValue;
        const classes = isActive ? "note-highlight" : "";
        return `<span class="note ${classes}">${notes.includes(noteValue) ? noteValue : ""}</span>`;
    }).join("")}</div>`;
}

// === Konfliktprüfung ===
function checkConflicts() {
    const settings = window.getSettings();
    const checkDuplicates = settings?.checkDuplicates ?? true;

    state.board.forEach(row => row.forEach(cell => cell.conflict = { row: false, col: false, block: false }));

    if (!checkDuplicates) {
        renderBoard();
        return;
    }

    const checkGroup = (getter, type) => {
        for (let i = 0; i < 9; i++) {
            const map = {};
            getter(i).forEach(({ row, col }) => {
                const val = state.board[row][col].value;
                if (!val) return;
                map[val] = map[val] || [];
                map[val].push({ row, col });
            });
            Object.values(map).forEach(cells => {
                if (cells.length > 1) cells.forEach(pos => state.board[pos.row][pos.col].conflict[type] = true);
            });
        }
    };

    checkGroup(i => Array.from({ length: 9 }, (_, c) => ({ row: i, col: c })), 'row');
    checkGroup(i => Array.from({ length: 9 }, (_, r) => ({ row: r, col: i })), 'col');
    checkGroup(i => {
        const sr = Math.floor(i / 3) * 3, sc = (i % 3) * 3;
        return Array.from({ length: 9 }, (_, idx) => ({
            row: sr + Math.floor(idx / 3),
            col: sc + (idx % 3)
        }));
    }, 'block');
}

// === Eingabehandling ===
function handleInput(value) {
    if (!state.activeCell) return;
    const { row, col } = state.activeCell;
    const cell = state.board[row][col];
    if (cell.fixed) return;

    const numValue = parseInt(value);
    state.save();

    if (state.isNoteMode) {
        cell.notes.includes(numValue) ?
            cell.notes = cell.notes.filter(n => n !== numValue) :
            cell.notes.push(numValue);
        cell.notes.sort();
    } else {
        cell.value = numValue;
        cell.notes = [];
        clearNotesForPeers(row, col, numValue);
        const settings = window.getSettings();
        cell.invalid = settings.checkMistakes ? !isValidInput(row, col, numValue) : false;
    }
    checkConflicts();
    renderBoard();
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
    const startRow = Math.floor(row / 3) * 3, startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++)
        for (let c = startCol; c < startCol + 3; c++)
            if (r !== row || c !== col) peers.push({ r, c });
    return peers;
}

function isValidInput(row, col, value) {
    return value === state.solution[row][col];
}

function validateBoard() {
    const settings = window.getSettings();
    state.board.forEach((row, r) => {
        row.forEach((cell, c) => {
            cell.invalid = (!cell.fixed && cell.value && settings.checkMistakes) ? !isValidInput(r, c, cell.value) : false;
        });
    });
    checkConflicts();
    renderBoard();
}
window.validateBoard = validateBoard;

// === Events ===
function setupEventHandlers() {
    document.getElementById("undoButton").addEventListener("click", () => state.undo());
    document.getElementById("redoButton").addEventListener("click", () => state.redo());
    document.getElementById("deleteButton").addEventListener("click", deleteActiveCell);
    document.getElementById("resetButton").addEventListener("click", resetGame);
    
    document.querySelector(".numPad").addEventListener("click", e => {
        if (!e.target.classList.contains("numButton")) return;
        const value = e.target.dataset.value;
        if (value === "N") {
            state.isNoteMode = !state.isNoteMode;
            e.target.classList.toggle("active", state.isNoteMode);
            return;
        }
        handleInput(value);
    });

    document.getElementById("sudoku").addEventListener("click", e => {
        const cell = e.target.closest("td");
        if (!cell) return;
        state.activeCell = { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col) };
        renderBoard();
    });

    document.getElementById("openSettings").addEventListener("click", () => toggleSidebar(true));
    document.getElementById("overlay").addEventListener("click", () => toggleSidebar(false));
}

function deleteActiveCell() {
    if (!state.activeCell) return;
    const { row, col } = state.activeCell;
    const cell = state.board[row][col];
    if (cell.fixed) return;
    state.save();
    Object.assign(cell, { value: null, notes: [], invalid: false, conflict: { row: false, col: false, block: false } });
    checkConflicts();
    renderBoard();
}

function resetGame() {
    state.board.forEach(row => row.forEach(cell => {
        if (!cell.fixed) Object.assign(cell, { value: null, notes: [], invalid: false, conflict: { row: false, col: false, block: false } });
    }));
    checkConflicts();
    renderBoard();
    restartTimer();
}

// === Sidebar ===
function toggleSidebar(open) {
    document.getElementById("sidebar").classList.toggle("open", open);
    document.getElementById("overlay").classList.toggle("active", open);
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

// === NEU: Highlight-Funktion ===
function highlightSameNumbers() {
    const settings = window.getSettings();
    const highlightActive = settings?.highlightNumbers ?? true;
    if (!highlightActive) return;

    document.querySelectorAll("#sudoku td").forEach(cell => {
        cell.classList.remove("highlight-same");
    });

    if (!state.activeCell) return;
    const { row, col } = state.activeCell;
    const targetValue = state.board[row][col].value;
    if (!targetValue) return;

    state.board.forEach((rowArr, r) => {
        rowArr.forEach((cellObj, c) => {
            if (cellObj.value === targetValue) {
                const td = document.querySelector(`#sudoku td[data-row="${r}"][data-col="${c}"]`);
                if (td) td.classList.add("highlight-same");
            }
        });
    });
}

function highlightPeers() {
    const settings = window.getSettings();
    const highlightActive = settings?.backgroundHighlight ?? true;

    // Erst alle bisherigen Hervorhebungen entfernen
    document.querySelectorAll("#sudoku td").forEach(cell => {
        cell.classList.remove("peer-highlight");
    });

    if (!highlightActive) return;
    if (!state.activeCell) return;

    const { row, col } = state.activeCell;
    const activeTd = document.querySelector(`#sudoku td[data-row="${row}"][data-col="${col}"]`);

    // Nur dann grau markieren, wenn noch nicht blau markiert
    if (activeTd && !activeTd.classList.contains("highlight-same")) {
        activeTd.classList.add("peer-highlight");
    }

    // Peers normal markieren
    const peers = getPeers(row, col);
    peers.forEach(({ r, c }) => {
        const td = document.querySelector(`#sudoku td[data-row="${r}"][data-col="${c}"]`);
        if (td) td.classList.add("peer-highlight");
    });
}
