import Keycloak from '/node_modules/keycloak-js/lib/keycloak.js';

const keycloak = new Keycloak({
    url: "http://localhost:8180",
    realm: "sudoku",
    clientId: "frontend"
});

export function login() {
    return keycloak.login(); // this redirects to Keycloak login
};

export async function initKeycloak() {
    await keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    }).then(() => {
        const loginButton = document.getElementById('login');
        if (!loginButton) return;

        if (!getKeyCloak().authenticated) {
            loginButton.innerHTML = 'Login';
            loginButton.removeEventListener('click', logout);
            loginButton.addEventListener('click', login);
        } else {
            loginButton.innerHTML = 'Logout';
            loginButton.removeEventListener('click', login);
            loginButton.addEventListener('click', logout);
        }
    }).then(authenticated => {
        if (authenticated) {
            setInterval(() => {
                keycloak.updateToken(100)
                    .catch(() => {
                        keycloak.logout();
                    });
            }, 100000);
        }
    });

    document.dispatchEvent(new CustomEvent("auth-ready", {
        detail: { keycloak }
    }));
    return;
}

export function getKeyCloak() {
    return keycloak;
};

export function getToken() {
    return keycloak.token;
};

export function logout() {
    return keycloak.logout();
};

export function isAuthenticated() {
    return keycloak.authenticated;
};

export default keycloak;