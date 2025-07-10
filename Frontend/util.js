async function fetchSudokuByDifficulty(difficulty) {
    try {
        const response = await fetch(`games/${difficulty}.json`);
        const data = await response.json();
        const randomGame = data[Math.floor(Math.random() * data.length)];
        localStorage.setItem("sudokuData", JSON.stringify(randomGame));
        window.location.href = "index.html";
    } catch (err) {
        console.error(`Fehler beim Laden von ${difficulty}:`, err);
    }
};