import { getToken, initKeycloak, isAuthenticated } from './auth.js';

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
		let timerInterval, startTime;
		let pausedTime = 0;
		let isPaused = false;
		let errorCount = 0;
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
document.addEventListener("DOMContentLoaded", async () => {
	await initKeycloak();
	await initGame();
});

function isCreateMode() {
	const params = new URLSearchParams(window.location.search);
	return params.get("mode") === "create";
}

async function initGame() {
	await
		await loadSettings();

	if (isCreateMode()) {
		createEmptyBoard();
		setupEventHandlers();
		renderBoard();
		updateErrorDisplay();
		return;
	}

	const storedData = sessionStorage.getItem("sudokuData");
	if (!storedData) {
		alert("No Sudoku has been found, please start again on homepage.");
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
		const data = JSON.parse(sessionStorage.getItem("sudokuData"));

		if (!data?.sudoku || !data?.solution)
			throw new Error("Ungültiges Datenformat");

		state.solution = data.solution;

		// Spielfeld wiederherstellen
		if (data.currentState) {
			state.board = data.currentState;
		} else {
			state.board = data.sudoku.map((row) =>
				row.map((cell) => ({
					value: cell || null,
					notes: [],
					fixed: !!cell,
					invalid: false,
					conflict: { row: false, col: false, block: false },
				}))
			);
		}

		// Fehleranzahl laden (falls vorhanden)
		if (typeof data.errorCount === "number") {
			state.errorCount = data.errorCount;
		} else {
			state.errorCount = 0;
		}

		// Zeit laden (falls vorhanden)
		if (typeof data.elapsedTime === "number") {
			state.loadedElapsedTime = data.elapsedTime;
		} else {
			state.loadedElapsedTime = 0;
		}

		// UndoStack laden (falls vorhanden)
		if (Array.isArray(data.undoStack)) {
			state.undoStack = data.undoStack;
		} else {
			state.undoStack = [];
		}

		// RedoStack laden (falls vorhanden)
		if (Array.isArray(data.redoStack)) {
			state.redoStack = data.redoStack;
		} else {
			state.redoStack = [];
		}
	} catch (err) {
		console.error("Fehler beim Laden des Sudoku:", err);
		alert("Fehler beim Laden des Sudokus. Bitte erneut versuchen.");
	}
}

function createEmptyBoard() {
	state.board = Array.from({ length: 9 }, () =>
		Array.from({ length: 9 }, () => ({
			value: null,
			notes: [],
			fixed: false,
			invalid: false,
			conflict: { row: false, col: false, block: false },
		}))
	);

	state.solution = [];
}

function hasConflict() {
	return state.board.some(row =>
		row.some(cell =>
			cell.conflict.row || cell.conflict.col || cell.conflict.block
		)
	);
}

function saveCreatedSudoku() {
	if (hasConflict()) {
		alert("Please resolve all conflicts before saving.");
		return;
	}

	const sudoku = state.board.map((row) =>
		row.map((cell) => cell.value || 0)
	);
	const gameData = {
		sudoku: sudoku,
		solution: [],
	};

	const json = JSON.stringify(gameData, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "my_sudoku.json";
	a.click();
	URL.revokeObjectURL(url);
}

// === Rendering ===
function renderBoard() {
	const table = document.getElementById("sudoku");
	table.innerHTML = state.board
		.map(
			(row, r) =>
				`<tr>${row.map((cell, c) => renderCell(cell, r, c)).join("")}</tr>`
		)
		.join("");
	highlightSameNumbers();
	highlightPeers();
	restoreActiveCellFocus();
}

function restoreActiveCellFocus() {
	if (!state.activeCell) return;
	const { row, col } = state.activeCell;
	const td = document.querySelector(
		`#sudoku td[data-row="${row}"][data-col="${col}"]`
	);
	if (td) td.focus();
}

window.renderBoard = renderBoard;

function renderCell(cell, r, c) {
	const hasConflict =
		cell.conflict.row || cell.conflict.col || cell.conflict.block;

	const classes = [
		cell.fixed ? "fixed" : "",
		cell.invalid ? "invalid" : "",
		cell.conflict.row ? "conflict-row" : "",
		cell.conflict.col ? "conflict-col" : "",
		cell.conflict.block ? "conflict-block" : "",
		state.activeCell?.row === r && state.activeCell?.col === c
			? "active-cell"
			: "",
		hasConflict ? "cell-conflict-border" : "",
	]
		.filter(Boolean)
		.join(" ");

	const content = cell.value
		? `<div class="cellValue">${cell.value}</div>`
		: renderNotes(cell.notes);

	return `<td class="${classes}" data-row="${r}" data-col="${c}" tabindex="0">
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

	return `<div class="notes">${[...Array(9)]
		.map((_, i) => {
			const noteValue = i + 1;
			const isActive = activeValue === noteValue;
			const classes = isActive ? "note-highlight" : "";
			return `<span class="note ${classes}">${notes.includes(noteValue) ? noteValue : ""
				}</span>`;
		})
		.join("")}</div>`;
}

// === Konfliktprüfung ===
function checkConflicts() {
	const settings = window.getSettings();
	const checkDuplicates = settings?.checkDuplicates ?? true;

	state.board.forEach((row) =>
		row.forEach(
			(cell) => (cell.conflict = { row: false, col: false, block: false })
		)
	);

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
			Object.values(map).forEach((cells) => {
				if (cells.length > 1)
					cells.forEach(
						(pos) => (state.board[pos.row][pos.col].conflict[type] = true)
					);
			});
		}
	};

	checkGroup(
		(i) => Array.from({ length: 9 }, (_, c) => ({ row: i, col: c })),
		"row"
	);
	checkGroup(
		(i) => Array.from({ length: 9 }, (_, r) => ({ row: r, col: i })),
		"col"
	);
	checkGroup((i) => {
		const sr = Math.floor(i / 3) * 3,
			sc = (i % 3) * 3;
		return Array.from({ length: 9 }, (_, idx) => ({
			row: sr + Math.floor(idx / 3),
			col: sc + (idx % 3),
		}));
	}, "block");
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
		if (cell.notes.includes(numValue)) {
			cell.notes = cell.notes.filter((n) => n !== numValue);
		} else {
			cell.notes.push(numValue);
			cell.notes.sort();
		}
	} else {
		if (cell.value === numValue) {
			cell.value = null;
			cell.notes = [];
			cell.invalid = false;
			checkConflicts();
			renderBoard();
			return;
		} else {
			cell.value = numValue;
			cell.notes = [];
			clearNotesForPeers(row, col, numValue);
		}

		const settings = window.getSettings();

		if (settings.checkMistakes && !isCreateMode()) {
			if (!isValidInput(row, col, numValue)) {
				if (!cell.invalid) {
					state.errorCount++;
					updateErrorDisplay();
				}
				cell.invalid = true;
			} else {
				cell.invalid = false;
			}
		} else {
			cell.invalid = false;
		}
	}

	checkConflicts();
	renderBoard();

	if (isGameWon()) {
		setTimeout(handleGameWon, 300);
	}
}

function clearNotesForPeers(row, col, value) {
	getPeers(row, col).forEach(({ r, c }) => {
		state.board[r][c].notes = state.board[r][c].notes.filter(
			(n) => n !== value
		);
	});
}

function getPeers(row, col) {
	const peers = [];
	for (let c = 0; c < BOARD_SIZE; c++) if (c !== col) peers.push({ r: row, c });
	for (let r = 0; r < BOARD_SIZE; r++) if (r !== row) peers.push({ r, c: col });
	const startRow = Math.floor(row / 3) * 3,
		startCol = Math.floor(col / 3) * 3;
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
	const checkMistakes = settings?.checkMistakes ?? true;

	state.errorCount = 0;

	state.board.forEach((row, r) => {
		row.forEach((cell, c) => {
			if (!cell.fixed && cell.value) {
				const isInvalid = checkMistakes
					? !isValidInput(r, c, cell.value)
					: false;
				cell.invalid = isInvalid;
				state.errorCount++;
			} else {
				cell.invalid = false;
			}
		});
	});

	updateErrorDisplay();
	checkConflicts();
	renderBoard();
}

window.validateBoard = validateBoard;

// === Events ===
function setupEventHandlers() {
	document
		.getElementById("undoButton")
		.addEventListener("click", () => state.undo());
	document
		.getElementById("redoButton")
		.addEventListener("click", () => state.redo());
	document
		.getElementById("deleteButton")
		.addEventListener("click", deleteActiveCell);
	document.getElementById("resetButton").addEventListener("click", resetGame);

	// Pause-Popup Events
	document
		.getElementById("pauseButton")
		.addEventListener("click", openPausePopup);
	document
		.getElementById("resumeButton")
		.addEventListener("click", closePausePopup);
	document.getElementById("exitButton").addEventListener("click", () => {
		closePausePopup();
		saveCurrentGame();
		setTimeout(() => {
			window.location.href = "startPage.html";
		}, 500);
	});

	// NEU: Schließen durch Klicken auf den Hintergrund
	document.getElementById("pausePopup").addEventListener("click", (e) => {
		if (e.target === document.getElementById("pausePopup")) {
			closePausePopup();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (document.getElementById("winPopup").style.display === "flex") return;

		if (e.key === "Escape") {
			togglePausePopup();
		} else if (e.key >= "1" && e.key <= "9") {
			e.preventDefault();
			handleInput(e.key);
		} else if (e.key === "Delete" || e.key === "Backspace") {
			e.preventDefault();
			deleteActiveCell();
		} else if (e.key === "n" || e.key === "N") {
			state.isNoteMode = !state.isNoteMode;
			const noteButton = document.querySelector('[data-value="N"]');
			if (noteButton) noteButton.classList.toggle("active", state.isNoteMode);
		} else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			e.preventDefault();
			state.undo();
		} else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
			e.preventDefault();
			state.redo();
		} else if (
			[
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"k",
				"j",
				"h",
				"l",
				"w",
				"s",
				"a",
				"d",
			].includes(e.key)
		) {
			e.preventDefault();
			navigateCell(e.key);
		}
	});

	document.querySelector(".numPad").addEventListener("click", (e) => {
		if (!e.target.classList.contains("numButton")) return;
		const value = e.target.dataset.value;
		if (value === "N") {
			state.isNoteMode = !state.isNoteMode;
			e.target.classList.toggle("active", state.isNoteMode);
			return;
		}
		handleInput(value);
	});

	document.getElementById("sudoku").addEventListener("click", (e) => {
		const cell = e.target.closest("td");
		if (!cell) return;
		state.activeCell = {
			row: parseInt(cell.dataset.row),
			col: parseInt(cell.dataset.col),
		};
		renderBoard();
	});

	document
		.getElementById("openSettings")
		.addEventListener("click", () => toggleSidebar(true));
	document
		.getElementById("overlay")
		.addEventListener("click", () => toggleSidebar(false));

	if (isCreateMode()) {
		const pauseButton = document.getElementById("pauseButton");
		pauseButton.textContent = "Title";
		pauseButton.addEventListener("click", () => {
			window.location.href = "startPage.html";
		});

		document.getElementById("timer").style.display = "none";

		const saveButton = document.createElement("button");
		saveButton.textContent = "Save";
		saveButton.classList.add("leftSideButton");
		saveButton.addEventListener("click", saveCreatedSudoku);
		document.querySelector(".leftSideButtons").appendChild(saveButton);
	}
}

function navigateCell(key) {
	if (!state.activeCell) {
		state.activeCell = { row: 0, col: 0 };
		renderBoard();
		return;
	}

	let { row, col } = state.activeCell;

	switch (key) {
		case "ArrowUp":
		case "k":
		case "w":
			row = Math.max(0, row - 1);
			break;
		case "ArrowDown":
		case "j":
		case "s":
			row = Math.min(BOARD_SIZE - 1, row + 1);
			break;
		case "ArrowLeft":
		case "h":
		case "a":
			col = Math.max(0, col - 1);
			break;
		case "ArrowRight":
		case "l":
		case "d":
			col = Math.min(BOARD_SIZE - 1, col + 1);
			break;
	}

	state.activeCell = { row, col };
	renderBoard();
}

// === Win/Lose-Popup ===
function openWinPopup() {
	clearInterval(state.timerInterval);
	state.pausedTime = Date.now();

	// Timer aktualisieren
	const elapsed = state.pausedTime - state.startTime;
	const minutes = Math.floor(state.elapsed / 60000);
	const seconds = Math.floor((state.elapsed % 60000) / 1000);
	document.getElementById("winTimerDisplay").textContent = `${pad(minutes)}:${pad(seconds)}`;

	// Fehlerstand aktualisieren
	const cappedErrors = Math.min(state.errorCount, 3);
	document.getElementById("winErrorDisplay").textContent = `Mistakes: ${cappedErrors}/3`;

	document.getElementById("winPopup").style.display = "flex";
}

function openLosePopup() {
	clearInterval(state.timerInterval);
	state.pausedTime = Date.now();

	const elapsed = state.pausedTime - state.startTime;
	const minutes = Math.floor(elapsed / 60000);
	const seconds = Math.floor((elapsed % 60000) / 1000);
	document.getElementById("loseTimerDisplay").textContent = `${pad(minutes)}:${pad(seconds)}`;

	document.getElementById("losePopup").style.display = "flex";
}

function retryGame() {
	document.getElementById("losePopup").style.display = "none";
	resetGame();
}

function deleteActiveCell() {
	if (!state.activeCell) return;
	const { row, col } = state.activeCell;
	const cell = state.board[row][col];
	if (cell.fixed) return;
	state.save();
	Object.assign(cell, {
		value: null,
		notes: [],
		invalid: false,
		conflict: { row: false, col: false, block: false },
	});
	checkConflicts();
	renderBoard();
}

function resetGame() {
	state.activeCell = null;
	state.board.forEach((row) =>
		row.forEach((cell) => {
			if (!cell.fixed)
				Object.assign(cell, {
					value: null,
					notes: [],
					invalid: false,
					conflict: { row: false, col: false, block: false },
				});
		})
	);
	checkConflicts();
	renderBoard();
	state.errorCount = 0;
	updateErrorDisplay();
	restartTimer(true);
}

// === Sidebar ===
function toggleSidebar(open) {
	document.getElementById("sidebar").classList.toggle("open", open);
	document.getElementById("overlay").classList.toggle("active", open);
}

// === Timer ===
let timerInterval, startTime;

function restartTimer(resetElapsed = false) {
	clearInterval(timerInterval);

	const initialElapsed = resetElapsed ? 0 : state.loadedElapsedTime || 0;
	startTime = Date.now() - initialElapsed;

	timerInterval = setInterval(updateTimer, 1000);
	updateTimer();
	updateErrorDisplay();
}

function updateTimer() {
	const elapsed = Date.now() - startTime;
	const minutes = Math.floor(elapsed / 60000);
	const seconds = Math.floor((elapsed % 60000) / 1000);
	document.getElementById("timer").textContent = `${pad(minutes)}:${pad(
		seconds
	)}`;
}

const pad = (num) => num.toString().padStart(2, "0");

// === Highlight-Funktion ===
function highlightSameNumbers() {
	const settings = window.getSettings();
	const highlightActive = settings?.highlightNumbers ?? true;
	if (!highlightActive) return;

	document.querySelectorAll("#sudoku td").forEach((cell) => {
		cell.classList.remove("highlight-same");
	});

	if (!state.activeCell) return;
	const { row, col } = state.activeCell;
	const targetValue = state.board[row][col].value;
	if (!targetValue) return;

	state.board.forEach((rowArr, r) => {
		rowArr.forEach((cellObj, c) => {
			if (cellObj.value === targetValue) {
				const td = document.querySelector(
					`#sudoku td[data-row="${r}"][data-col="${c}"]`
				);
				if (td) td.classList.add("highlight-same");
			}
		});
	});
}

function highlightPeers() {
	const settings = window.getSettings();
	const highlightActive = settings?.backgroundHighlight ?? true;

	// Erst alle bisherigen Hervorhebungen entfernen
	document.querySelectorAll("#sudoku td").forEach((cell) => {
		cell.classList.remove("peer-highlight");
	});

	if (!highlightActive) return;
	if (!state.activeCell) return;

	const { row, col } = state.activeCell;
	const activeTd = document.querySelector(
		`#sudoku td[data-row="${row}"][data-col="${col}"]`
	);

	// Nur dann grau markieren, wenn noch nicht blau markiert
	if (activeTd && !activeTd.classList.contains("highlight-same")) {
		activeTd.classList.add("peer-highlight");
	}

	// Peers normal markieren
	const peers = getPeers(row, col);
	peers.forEach(({ r, c }) => {
		const td = document.querySelector(
			`#sudoku td[data-row="${r}"][data-col="${c}"]`
		);
		if (td) td.classList.add("peer-highlight");
	});
}

function openPausePopup() {
	clearInterval(timerInterval);
	state.pausedTime = Date.now();

	// Timer aktualisieren
	const elapsed = state.pausedTime - startTime;
	const minutes = Math.floor(elapsed / 60000);
	const seconds = Math.floor((elapsed % 60000) / 1000);
	document.getElementById("pauseTimerDisplay").textContent = `${pad(
		minutes
	)}:${pad(seconds)}`;

	// Fehlerstand aktualisieren
	const cappedErrors = Math.min(state.errorCount, 3);
	document.getElementById(
		"pauseErrorDisplay"
	).textContent = `Mistakes: ${cappedErrors}/3`;

	document.getElementById("pausePopup").style.display = "flex";
}

function closePausePopup() {
	const pauseDuration = Date.now() - state.pausedTime;
	startTime += pauseDuration;
	timerInterval = setInterval(updateTimer, 1000);
	document.getElementById("pausePopup").style.display = "none";
}

function togglePausePopup() {
	if (document.getElementById("pausePopup").style.display === "flex") {
		closePausePopup();
	} else {
		openPausePopup();
	}
}

function openPlayPopup() {
	document.getElementById("playPopup").classList.add("active");
}

function startNewGame() {
	openPlayPopup();
}

function saveCurrentGame() {
	const startBoard = state.board.map((row) =>
		row.map((cell) => (cell.fixed ? cell.value : null))
	);

	const elapsed = Date.now() - startTime;

	const gameData = {
		sudoku: startBoard,
		solution: state.solution,
		currentState: state.board,
		errorCount: state.errorCount,
		elapsedTime: elapsed,
		undoStack: state.undoStack,
		redoStack: state.redoStack,
	};

	if (!isAuthenticated()) {
		sessionStorage.setItem("sudokuContinueData", JSON.stringify(gameData));
	}
	else {
		const token = getToken();
		const data = fetch(`http://localhost:8080/sudoku/save`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					'Authorization': 'Bearer ' + token
				},
				body: JSON.stringify({
					sudoku: gameData.sudoku,
					solution: gameData.solution,
					errorCount: gameData.errorCount,
					elapsedTime: gameData.elapsedTime
				})
			}
		).then(response => {
			if (!response.ok) {
				throw new Error("Could not store game for later!")
			}
			return response.json();
		}).catch(err => {
			console.error('Fetch error:', err);
		});
	}
}

function updateErrorDisplay() {
	const settings = window.getSettings();
	const checkMistakes = settings?.checkMistakes ?? true;

	const errorCounterElement = document.getElementById("errorCounter");
	const pauseErrorDisplayElement = document.getElementById("pauseErrorDisplay");

	if (!checkMistakes || isCreateMode()) {
		// Fehleranzeige komplett ausblenden
		errorCounterElement.style.display = "none";
		pauseErrorDisplayElement.style.display = "none";
		return;
	}

	// Fehleranzeige sichtbar machen
	errorCounterElement.style.display = "inline";
	pauseErrorDisplayElement.style.display = "inline";

	const cappedErrors = Math.min(state.errorCount, 3);
	errorCounterElement.textContent = `Mistakes: ${cappedErrors}/3`;
	pauseErrorDisplayElement.textContent = `Mistakes: ${cappedErrors}/3`;

	if (cappedErrors >= 3) {
		setTimeout(handleGameOver, 10);
	}
}

function isGameWon() {
	return state.board.every((row, r) =>
		row.every((cell, c) =>
			cell.value === state.solution[r][c]
		)
	);
}

function handleGameWon() {
	openWinPopup();
	fetch(`http://localhost:8080/sudoku/cancel`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				'Authorization': 'Bearer ' + getToken()
			}
		}
	).then(response => {
		if (!response.ok) {
			throw new Error("Could not cancel lost game!")
		}
		return response.json();
	}).catch(err => {
		console.error('Fetch error:', err);
	});
	// window.location.href = "startPage.html";
}

function handleGameOver() {
	openLosePopup();
	fetch(`http://localhost:8080/sudoku/cancel`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				'Authorization': 'Bearer ' + getToken()
			}
		}
	).then(response => {
		if (!response.ok) {
			throw new Error("Could not cancel lost game!")
		}
		return response.json();
	}).catch(err => {
		console.error('Fetch error:', err);
	});
	// window.location.href = "startPage.html";
}
