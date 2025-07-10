import { getToken, getKeyCloak } from './auth.js';

// Globale Variable für aktuelle Einstellungen
let currentSettings = {
    checkMistakes: false,
    checkDuplicates: false,
    highlightNumbers: true,
    backgroundHighlight: false,
};

// Mapping zwischen Toggle-IDs und Setting-Schlüsseln
const toggleMap = {
    checkMistakes: 'checkMistakes',
    checkDuplicates: 'checkDuplicates',
    highlightNumbers: 'highlightNumbers',
    backgroundHighlight: 'backgroundHighlight',
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
    if (getKeyCloak().authenticated) {
        const token = getToken();
        const data = fetch(`http://localhost:8080/settings/save`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token
                },
                body: getCookie("sudokuSettings")
            }
        ).then(response => {
            if (!response.ok) {
                return currentSettings;
            }
            return response.json();
        }).catch(err => {
            console.error('Fetch error:', err);
        });
        currentSettings = data;
    }
}

// Einstellungen laden
async function loadSettings() {
    const kc = getKeyCloak();
    if (!getKeyCloak().authenticated) {
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
    else {
        getKeyCloak();
        const token = getToken();
        const data = await fetch(`http://localhost:8080/settings/load`,
            {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }
        ).then(response => {
            if (!response.ok) {
                throw new Error("Unable to load settings!");
            }
            return response.json();
        }).catch(err => {
            console.error('Fetch error:', err);
        });

        currentSettings = {
            checkMistakes: data.checkMistakes,
            checkDuplicates: data.checkDuplicates,
            highlightNumbers: data.highlightNumbers,
            backgroundHighlight: data.backgroundHighlight,
        };

        document.querySelectorAll('.toggleSwitch input').forEach(toggle => {
            toggle.checked = currentSettings[toggle.id];
        });
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
async function initializeSettings() {
    await loadSettings();
    setupSettingsListeners();
}

document.addEventListener("auth-ready", async (e) => {
    await initializeSettings();
});
// document.addEventListener("DOMContentLoaded", initializeSettings);
window.addEventListener("pageshow", initializeSettings);