document.addEventListener("DOMContentLoaded", () => {
    // Elemente zentral definieren
    const elements = {
        openSettingsButton: document.getElementById("openSettings"),
        sidebar: document.getElementById("sidebar"),
        overlay: document.getElementById("overlay"),
        rulesButton: document.querySelector(".menuButton:first-child"),
        rulesSidebar: document.getElementById("rulesSidebar"),
        closeRulesButton: document.getElementById("closeRules"),
        playButton: document.querySelectorAll(".menuButton")[1],
        playPopup: document.getElementById("playPopup"),
        closePlayPopupButton: document.getElementById("closePlayPopup"),
        popupButtons: document.querySelectorAll(".popupButton"),
    };

    // Hilfsfunktionen
    const toggleClass = (el, cls, add) => el.classList.toggle(cls, add);
    const toggleVisibility = (el, show, display = "block") => el.style.display = show ? display : "none";

    // Sidebar-Handling
    const openSidebar = () => {
        toggleClass(elements.sidebar, "open", true);
        toggleClass(elements.overlay, "active", true);
    };

    const closeSidebar = () => {
        toggleClass(elements.sidebar, "open", false);
        toggleClass(elements.overlay, "active", false);
    };

    // Rules Sidebar-Handling
    const openRulesSidebar = () => {
        toggleClass(elements.rulesSidebar, "open", true);
        toggleClass(elements.overlay, "active", true);
    };

    const closeRulesSidebar = () => {
        toggleClass(elements.rulesSidebar, "open", false);
        toggleClass(elements.overlay, "active", false);
    };

    // Play Popup-Handling
    const openPlayPopup = () => toggleVisibility(elements.playPopup, true, "flex");
    const closePlayPopup = () => toggleVisibility(elements.playPopup, false);

    // Eventbindungen
    elements.openSettingsButton?.addEventListener("click", openSidebar);
    elements.rulesButton?.addEventListener("click", openRulesSidebar);
    elements.closeRulesButton?.addEventListener("click", closeRulesSidebar);
    elements.playButton?.addEventListener("click", openPlayPopup);
    elements.closePlayPopupButton?.addEventListener("click", closePlayPopup);

    elements.overlay?.addEventListener("click", () => {
        closeSidebar();
        closeRulesSidebar();
        closePlayPopup();
    });

    elements.playPopup?.addEventListener("click", (e) => {
        if (!e.target.closest(".popupContent")) closePlayPopup();
    });

    // Setup für Schwierigkeits-Buttons
    const setupSudokuButton = (button, difficulty) => {
        button.addEventListener("click", async () => {
            try {
                const res = await fetch(`games/${difficulty}.json`);
                const data = await res.json();
                const randomSudoku = data[Math.floor(Math.random() * data.length)];
                localStorage.setItem("sudokuData", JSON.stringify(randomSudoku));
                window.location.href = "index.html";
            } catch (err) {
                console.error(`Fehler beim Laden der ${difficulty} Sudokus:`, err);
            }
        });
    };

    const difficulties = ["easy", "medium", "hard"];
    elements.popupButtons.forEach((button, i) => {
        setupSudokuButton(button, difficulties[i]);
    });
});
