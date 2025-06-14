document.addEventListener("DOMContentLoaded", () => {

    const elements = {
        settingsButton: document.getElementById("openSettings"),
        settingsSidebar: document.getElementById("sidebar"),
        rulesButton: document.getElementById("openRules"),
        rulesSidebar: document.getElementById("rulesSidebar"),
        overlay: document.getElementById("overlay"),
        playButton: document.querySelectorAll(".menuButton")[1],
        playPopup: document.getElementById("playPopup"),
        popupButtons: document.querySelectorAll(".popupButton"),
        importButton: document.getElementById("importButton"),
        fileInput: document.getElementById("fileInput"),
    };

    elements.importButton?.addEventListener("click", () => {
    elements.fileInput.click();
});

elements.fileInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            console.log("Importierte Daten:", data);
            localStorage.setItem("sudokuData", JSON.stringify(data));
            window.location.href = "index.html";
        } catch (err) {
            alert("Fehler beim Einlesen der Datei.");
            console.error(err);
        }
    };
    reader.readAsText(file);
});

    // Utility Funktionen 
    const showElement = (el, show = true, display = "block") => {
        if (el) el.style.display = show ? display : "none";
    };

    const toggleClass = (el, className, add) => {
        if (el) el.classList.toggle(className, add);
    };

    // Öffnen und Schließen Logiken 
    const openSidebar = () => {
        toggleClass(elements.settingsSidebar, "open", true);
        toggleClass(elements.overlay, "active", true);
    };

    const closeSidebar = () => {
        toggleClass(elements.settingsSidebar, "open", false);
        toggleClass(elements.overlay, "active", false);
    };

    const openRules = () => {
        toggleClass(elements.rulesSidebar, "open", true);
        toggleClass(elements.overlay, "active", true);
    };

    const closeRules = () => {
        toggleClass(elements.rulesSidebar, "open", false);
        toggleClass(elements.overlay, "active", false);
    };

    const openPlayPopup = () => showElement(elements.playPopup, true, "flex");
    const closePlayPopup = () => showElement(elements.playPopup, false);

    // Event Listener sauber binden 
    elements.settingsButton?.addEventListener("click", openSidebar);
    elements.rulesButton?.addEventListener("click", openRules);
    document.getElementById("closeRules")?.addEventListener("click", closeRules);
    elements.playButton?.addEventListener("click", openPlayPopup);

    elements.overlay?.addEventListener("click", () => {
        closeSidebar();
        closeRules();
        closePlayPopup();
    });

    elements.playPopup?.addEventListener("click", (e) => {
        if (!e.target.closest(".popupContent")) closePlayPopup();
    });

    //  Sudoku Lade-Logik 
    const loadSudoku = async (difficulty) => {
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

    // Popup Buttons verarbeiten 
    const difficulties = ["easy", "medium", "hard", "continue"];
    elements.popupButtons.forEach((button, index) => {
        const difficulty = difficulties[index];
        button.addEventListener("click", () => {
            if (difficulty === "continue") {
                const savedGame = localStorage.getItem("sudokuContinueData");
                if (savedGame) {
                    localStorage.setItem("sudokuData", savedGame);
                    window.location.href = "index.html";
                } else {
                    alert("No saved game found.");
                }
            } else {
                loadSudoku(difficulty);
            }
        });
    });
});
