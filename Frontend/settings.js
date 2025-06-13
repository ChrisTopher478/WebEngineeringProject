// Globale Variable für aktuelle Einstellungen
let currentSettings = {
    darkMode: false,
    checkMistakes: false,
    checkDuplicates: false,
    highlightNumbers: false,
    backgroundHighlight: false,
};

// Cookie-Hilfsfunktionen
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ").reduce((acc, curr) => {
        const [k, v] = curr.split("=");
        acc[k] = v ? decodeURIComponent(v) : "";
        return acc;
    }, {});
    return cookies[name];
}

// Hole Toggle-Element anhand ID
function getToggle(id) {
    return document.getElementById(id);
}

// Speichern der aktuellen Einstellungen
function saveSettings() {
    const settings = {
        darkMode: getToggle("toggle1")?.checked ?? false,
        checkMistakes: getToggle("toggle2")?.checked ?? false,
        checkDuplicates: getToggle("toggle3")?.checked ?? false,
        highlightNumbers: getToggle("toggle4")?.checked ?? false,
        backgroundHighlight: getToggle("toggle5")?.checked ?? false,
    };
    setCookie("sudokuSettings", JSON.stringify(settings));
    currentSettings = settings;
}

// Laden der gespeicherten Einstellungen
function loadSettings() {
    const stored = getCookie("sudokuSettings");
    if (!stored) return;

    const settings = JSON.parse(stored);
    currentSettings = settings;

    const toggleMap = {
        toggle1: 'darkMode',
        toggle2: 'checkMistakes',
        toggle3: 'checkDuplicates',
        toggle4: 'highlightNumbers',
        toggle5: 'backgroundHighlight',
    };

    Object.entries(toggleMap).forEach(([id, key]) => {
        const toggle = getToggle(id);
        if (toggle) toggle.checked = settings[key];
    });
}

// Event Listener auf alle Toggle-Schalter einbinden
function setupSettingsListeners() {
    document.querySelectorAll('.toggleSwitch input').forEach(toggle => {
        toggle.addEventListener('change', () => {
            saveSettings();
            window.validateBoard?.();
        });
    });
}

// Export: Funktionen global verfügbar machen
window.getSettings = () => currentSettings;
window.loadSettings = loadSettings;
window.setupSettingsListeners = setupSettingsListeners;

// Automatisch beim Laden Settings anwenden
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    setupSettingsListeners();
});

