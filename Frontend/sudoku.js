// Globale Zustände
let sudokuBoard = [];
let activeCell = null;
let isNoteMode = false;

document.addEventListener("DOMContentLoaded", initGame);

function initGame() {
    setupEventHandlers();
    loadSudoku();
}

function setupEventHandlers() {
    initNumPadEvents();
    initSidebarEvents();
}

// Sudoku aus JSON laden
async function loadSudoku() {
    try {
        const response = await fetch('sudoku.json');
        const data = await response.json();
        sudokuBoard = data.sudoku.map(row => 
            row.map(cell => ({
                value: cell !== 0 ? cell : null,
                notes: [],
                fixed: cell !== 0
            }))
        );
        renderBoard();
    } catch (error) {
        console.error("Fehler beim Laden des Sudokus:", error);
    }
}

// Board zeichnen
function renderBoard() {
    const table = document.getElementById("sudoku");
    table.innerHTML = "";

    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        const row = table.insertRow();

        for (let colIndex = 0; colIndex < 9; colIndex++) {
            const cell = row.insertCell();
            const cellData = sudokuBoard[rowIndex][colIndex];
            
            const cellContainer = document.createElement("div");
            cellContainer.classList.add("cellContainer");

            renderCellContent(cellData, cellContainer);

            cell.appendChild(cellContainer);
            applyCellBorders(cell, rowIndex, colIndex);

            // Klick-Handling
            cell.addEventListener("click", () => {
                activeCell = { row: rowIndex, col: colIndex };
            });
        }
    }
}

// Inhalt je nach Zustand rändern
function renderCellContent(cellData, container) {
    if (cellData.fixed) {
        container.textContent = cellData.value;
        container.classList.add("fixed");
    } else if (cellData.value) {
        addCellValue(container, cellData.value);
    } else if (cellData.notes.length > 0) {
        addCellNotes(container, cellData.notes);
    }
}

function addCellValue(container, value) {
    const valueDiv = document.createElement("div");
    valueDiv.classList.add("cellValue");
    valueDiv.textContent = value;
    container.appendChild(valueDiv);
}

function addCellNotes(container, notes) {
    const notesDiv = document.createElement("div");
    notesDiv.classList.add("notes");
    for (let n = 1; n <= 9; n++) {
        const note = document.createElement("span");
        note.classList.add("note");
        note.textContent = notes.includes(n) ? n : "";
        notesDiv.appendChild(note);
    }
    container.appendChild(notesDiv);
}

// Randlinien korrekt setzen
function applyCellBorders(cell, rowIndex, colIndex) {
    const standard = "1px solid #999";
    const thick = "2px solid #000";

    cell.style.borderTop = (rowIndex === 0 || rowIndex % 3 === 0) ? thick : standard;
    cell.style.borderBottom = (rowIndex === 8) ? thick : standard;
    cell.style.borderLeft = (colIndex === 0 || colIndex % 3 === 0) ? thick : standard;
    cell.style.borderRight = (colIndex === 8) ? thick : standard;
}

// Nummernfeld-Events
function initNumPadEvents() {
    document.querySelectorAll(".numButton").forEach(button => {
        button.addEventListener("click", () => handleNumPadClick(button));
    });
}

function handleNumPadClick(button) {
    const value = button.dataset.value;

    if (value === "N") {
        isNoteMode = !isNoteMode;
        button.classList.toggle("active", isNoteMode);
        return;
    }

    if (!activeCell) return;

    const { row, col } = activeCell;
    const cellData = sudokuBoard[row][col];

    if (cellData.fixed) return;

    const numValue = parseInt(value);

    if (isNoteMode) {
        toggleNote(cellData, numValue);
    } else {
        cellData.value = numValue;
        cellData.notes = [];
    }

    renderBoard();
}

function toggleNote(cellData, numValue) {
    const notes = cellData.notes;
    if (notes.includes(numValue)) {
        cellData.notes = notes.filter(n => n !== numValue);
    } else {
        cellData.notes.push(numValue);
        cellData.notes.sort();
    }
}

// Sidebar-Events
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