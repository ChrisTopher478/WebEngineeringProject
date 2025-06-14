// Globale Variable für aktuelle Einstellungen
let currentSettings = {
    darkMode: false,
    checkMistakes: false,
    checkDuplicates: false,
    highlightNumbers: true,
    backgroundHighlight: false,
};

// Mapping zwischen Toggle-IDs und Setting-Schlüsseln
const toggleMap = {
    toggle1: 'darkMode',
    toggle2: 'checkMistakes',
    toggle3: 'checkDuplicates',
    toggle4: 'highlightNumbers',
    toggle5: 'backgroundHighlight',
};

// Cookie-Hilfsfunktionen
const setCookie = (name, value, days = 365) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name) => {
    return document.cookie
        .split("; ")
        .map(c => c.split("="))
        .reduce((acc, [k, v]) => ({ ...acc, [k]: decodeURIComponent(v || "") }), {})[name];
};

const getToggle = (id) => document.getElementById(id);

// Einstellungen speichern
function saveSettings() {
    const settings = Object.entries(toggleMap).reduce((acc, [id, key]) => {
        acc[key] = getToggle(id)?.checked ?? false;
        return acc;
    }, {});
    setCookie("sudokuSettings", JSON.stringify(settings));
    currentSettings = settings;
}

// Einstellungen laden
function loadSettings() {
    const stored = getCookie("sudokuSettings");
    if (!stored) return;

    try {
        const settings = JSON.parse(stored);
        currentSettings = settings;

        Object.entries(toggleMap).forEach(([id, key]) => {
            const toggle = getToggle(id);
            if (toggle) toggle.checked = settings[key];
        });
    } catch (e) {
        console.error("Error while loading the saved settings:", e);
    }
}

// Event-Listener für alle Toggles einrichten
function setupSettingsListeners() {
    document.querySelectorAll('.toggleSwitch input').forEach(toggle => {
        toggle.replaceWith(toggle.cloneNode(true));
    });

    document.querySelectorAll('.toggleSwitch input').forEach(toggle => {
        toggle.addEventListener('change', () => {
            saveSettings();
            window.validateBoard?.();
            window.renderBoard?.();
            window.updateErrorDisplay?.();
        });
    });
}

// Globale Exporte
window.getSettings = () => currentSettings;
window.loadSettings = loadSettings;
window.setupSettingsListeners = setupSettingsListeners;

// Initialisierung
function initializeSettings() {
    loadSettings();
    setupSettingsListeners();
}

document.addEventListener("DOMContentLoaded", initializeSettings);
window.addEventListener("pageshow", initializeSettings);