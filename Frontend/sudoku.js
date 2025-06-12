let sudoku = [];
let activeInput = null;

document.addEventListener("DOMContentLoaded", () => {
    setupNumPad();
    loadSudokuFromJSON();
    setupSidebar();
});

async function loadSudokuFromJSON() {
    try {
        const response = await fetch('sudoku.json');
        const data = await response.json();
        sudoku = data.sudoku;
        renderSudokuBoard();
    } catch (error) {
        console.error("Fehler beim Laden des Sudokus:", error);
    }
}

function renderSudokuBoard() {
    const table = document.getElementById("sudoku");
    table.innerHTML = "";

    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        const row = table.insertRow();

        for (let colIndex = 0; colIndex < 9; colIndex++) {
            const cell = row.insertCell();

            if (sudoku[rowIndex][colIndex] !== 0) {
                cell.textContent = sudoku[rowIndex][colIndex];
                cell.classList.add("fixed");
            } else {
                const input = createCellInput
                ();
                cell.appendChild(input);
            }

            applySudokuBorders(cell, rowIndex, colIndex);
        }
    }
}

function createCellInput
() {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;

    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-9]/g, '');
    });

    input.addEventListener("focus", () => {
        activeInput = input;
    });

    return input;
}

function applySudokuBorders(cell, rowIndex, colIndex) {
    const standardBorder = "1px solid #999";
    const thickBorder = "2px solid #000";

    cell.style.borderTop = (rowIndex === 0 || (rowIndex % 3 === 0 && rowIndex !== 0)) ? thickBorder : standardBorder;
    cell.style.borderBottom = (rowIndex === 8) ? thickBorder : standardBorder;
    cell.style.borderLeft = (colIndex === 0 || (colIndex % 3 === 0 && colIndex !== 0)) ? thickBorder : standardBorder;
    cell.style.borderRight = (colIndex === 8) ? thickBorder : standardBorder;
}

function setupNumPad() {
    document.querySelectorAll(".numButton").forEach(button => {
        button.addEventListener("click", () => {
            if (activeInput) {
                const value = button.dataset.value;
                activeInput.value = value === "N" ? "" : value;
            }
        });
    });
}

function setupSidebar() {
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
