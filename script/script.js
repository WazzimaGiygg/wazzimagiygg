<script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics-compat.js"></script>
<script>
// --- Configuração do Firebase ---
const firebaseConfig = { /* cite: 143 */
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0", // Use sua própria chave! /* cite: 144 */
    authDomain: "wzzm-ce3fc.firebaseapp.com", /* cite: 144 */
    projectId: "wzzm-ce3fc", /* cite: 144 */
    storageBucket: "wzzm-ce3fc.appspot.com", /* cite: 144 */
    messagingSenderId: "249427877153", /* cite: 144 */
    appId: "1:249427877153:web:0e4297294794a5aadeb260", /* cite: 144 */
    measurementId: "G-PLKNZNFCQ8" /* cite: 145 */
}; /* cite: 146 */
// Inicialize Firebase
const app = firebase.initializeApp(firebaseConfig); /* cite: 147 */
const auth = firebase.auth(); /* cite: 148 */
const firestore = firebase.firestore(); /* cite: 149 */
firebase.analytics(); /* cite: 150 */

// Variáveis globais para estado do usuário
let currentUser = null; /* cite: 151 */
let isCurrentUserBanned = false; /* cite: 152 */
// let unsubscribeNotifications = null; // REMOVED /* cite: 153 */

// --- Funções Auxiliares (Antiga loadPage foi substituída pela nova que cria janelas flutuantes) ---
// A função loadPage original que manipulava 'contentFrame' não é mais usada diretamente para links de navegação.
// Ela ainda é referenciada em outras partes do código para manipulação de mensagens de acesso/banimento,
// mas a navegação principal usará a nova createFloatingWindow.

// Função para ativar/desativar links de navegação com base no status de login
function setNavLinksEnabled(enabled) {
    const navLinks = document.querySelectorAll('.mdl-navigation__link[data-requires-auth="true"]'); /* cite: 169 */
    navLinks.forEach(link => {
        if (enabled) {
            link.style.pointerEvents = 'auto';
            link.style.color = '#424242'; // Cor padrão
        } else { /* cite: 170 */
            link.style.pointerEvents = 'none'; /* cite: 170 */
            link.style.color = '#9e9e9e'; /* cite: 170 */
        }
    }); /* cite: 171 */
}

// Função para criar/atualizar o documento do perfil do usuário no Firestore
async function createUserProfileDocument(user) {
    if (!user) return; /* cite: 172 */
    const userRef = firestore.doc(`users/${user.uid}`); /* cite: 173 */
    const snapshot = await userRef.get(); /* cite: 174 */

    if (!snapshot.exists) {
        const { displayName, email, photoURL } = user; /* cite: 175 */
        const createdAt = new Date(); /* cite: 176 */

        try {
            await userRef.set({
                displayName,
                email,
                photoURL, /* cite: 177 */
                createdAt, /* cite: 177 */
                isAdmin: false, // Define como false por padrão
                isBan: false // Define como false por padrão /* cite: 178 */
            }); /* cite: 179 */
            console.log("Perfil do usuário criado no Firestore."); /* cite: 180 */
        } catch (error) {
            console.error("Erro ao criar perfil do usuário:", error); /* cite: 181 */
        }
    }
}

// Função para carregar e aplicar CSS de aplicativos específicos do usuário
async function loadAndApplyUserAppsCSS(userId) {
    const customAppCssStyleTag = document.getElementById('custom-app-css'); /* cite: 182 */
    if (!customAppCssStyleTag) return; /* cite: 183 */

    try {
        const userAppsSnapshot = await firestore.collection('userApps').doc(userId).get(); /* cite: 184 */
        if (userAppsSnapshot.exists) {
            const appData = userAppsSnapshot.data(); /* cite: 185 */
            let cssContent = ''; /* cite: 186 */
            if (appData && appData.apps) {
                appData.apps.forEach(app => {
                    if (app.css) {
                        cssContent += app.css + '\n'; /* cite: 187 */
                    }
                });
            }
            customAppCssStyleTag.innerHTML = cssContent; /* cite: 189 */
        } else {
            customAppCssStyleTag.innerHTML = ''; /* cite: 190 */
        }
    } catch (error) {
        console.error("Erro ao carregar CSS de aplicativos do usuário:", error); /* cite: 191 */
        customAppCssStyleTag.innerHTML = ''; /* cite: 192 */
    }
}

// Removidas funções relacionadas a notificações: updateNotificationBadge, listenForNotifications, showNotificationsPopup, hideNotificationsPopup

// --- FUNÇÕES PARA O POPUP DE NOTÍCIAS (MANTIDAS) ---
function showNewsPopup() {
    const newsCenterPopup = document.getElementById('news-center-popup'); /* cite: 193 */
    if (newsCenterPopup) {
        newsCenterPopup.style.display = 'flex'; /* cite: 194 */
        fetchLatestNews(); // Fetch news when popup is shown /* cite: 195 */
    }
}

function hideNewsPopup() {
    const newsCenterPopup = document.getElementById('news-center-popup'); /* cite: 196 */
    if (newsCenterPopup) {
        newsCenterPopup.style.display = 'none'; /* cite: 197 */
    }
}

// Função para buscar as últimas notícias e exibi-las no popup
async function fetchLatestNews() {
    const newsPopupContent = document.getElementById('news-popup-content'); /* cite: 198 */
    newsPopupContent.innerHTML = '<p>Carregando últimas notícias...</p>'; /* cite: 199 */
    try {
        const newsSnapshot = await firestore.collection('news')
            .orderBy('createdAt', 'desc')
            .limit(5) // Limita a 5 notícias para o popup
            .get(); /* cite: 200 */
        if (newsSnapshot.empty) {
            newsPopupContent.innerHTML = '<p>Nenhuma notícia encontrada.</p>'; /* cite: 201 */
            return; /* cite: 202 */
        }

        newsPopupContent.innerHTML = ''; /* cite: 203 */
        // Limpa o conteúdo existente
        newsSnapshot.forEach(doc => {
            const news = doc.data();
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-popup-item'); // Use uma classe específica para o popup /* cite: 204 */

            const timestampDate = news.createdAt ? news.createdAt.toDate() : new Date(); /* cite: 204 */
            const timeString = timestampDate.toLocaleString([], {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit' /* cite: 205 */
            });

            newsItem.innerHTML = `
                <h3>${news.title}</h3> /* cite: 206 */
                <p>${news.description}</p>
                <small>Categoria: ${news.category}</small><br> ${news.tags && news.tags.length > 0 ? `<small>Tags: ${news.tags.join(', ')}</small><br>` : ''}
                <small>Publicado em: ${timeString}</small> /* cite: 207 */
                ${news.imageUrl ? `<img src="${news.imageUrl}" alt="Imagem da Notícia">` : ''} `; /* cite: 208 */
            newsPopupContent.appendChild(newsItem); /* cite: 208 */
        }); /* cite: 209 */

    } catch (error) {
        console.error("Erro ao buscar últimas notícias para o popup:", error); /* cite: 210 */
        newsPopupContent.innerHTML = `<p style="color: red;">Erro ao carregar notícias: ${error.message}</p>`; /* cite: 211 */
    }
}

// Removidas funções para o Chat Popup: showChatPopup, hideChatPopup, loadChatPopupContent

// --- Funções de Autenticação (EXISTENTES) ---
const providerGoogle = new firebase.auth.GoogleAuthProvider(); /* cite: 212 */
const providerGitHub = new firebase.auth.GithubAuthProvider(); /* cite: 213 */

document.getElementById('login-google').addEventListener('click', () => {
    auth.signInWithPopup(providerGoogle)
        .catch(error => {
            console.error("Erro no login com Google:", error);
        });
});
document.getElementById('login-github').addEventListener('click', () => { /* cite: 214 */
    auth.signInWithPopup(providerGitHub)
        .catch(error => {
            console.error("Erro no login com GitHub:", error);
        });
}); /* cite: 215 */

function handleLogout() {
    auth.signOut().then(() => {
        console.log("Usuário deslogado.");
    }).catch((error) => {
        console.error("Erro ao deslogar:", error);
    }); /* cite: 216 */
}
const logoutButton = document.getElementById('logout-button'); /* cite: 217 */
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout); /* cite: 218 */
}

// --- Gerenciamento de Estado de Autenticação ---
auth.onAuthStateChanged(async (user) => {
    currentUser = user; // Define o currentUser globalmente
    const userInfo = document.getElementById('user-info');
    const loginGoogleButton = document.getElementById('login-google');
    const loginGitHubButton = document.getElementById('login-github'); /* cite: 219 */
    const logoutButton = document.getElementById('logout-button'); /* cite: 219 */
    const userProfilePic = document.getElementById('user-profile-pic'); /* cite: 219 */
    const googleAppsButton = document.getElementById('google-apps-button'); /* cite: 219 */
    const userInfoContainer = document.getElementById('user-info-container'); /* cite: 219 */
    const googleAppsPopup = document.getElementById('google-apps-popup'); /* cite: 219 */
    const customAppCssStyleTag = document.getElementById('custom-app-css'); /* cite: 221 */
    const contentFrame = document.getElementById('contentFrame'); /* cite: 222 */
    const accessDeniedMessage = document.getElementById('access-denied-message'); /* cite: 223 */
    const bannedMessage = document.getElementById('banned-message'); /* cite: 224 */
    // const notificationBellButton = document.getElementById('notification-bell-button'); // REMOVED /* cite: 225 */
    const newsButton = document.getElementById('news-button'); /* cite: 226 */
    const newsCenterPopup = document.getElementById('news-center-popup'); /* cite: 227 */
    // const chatButton = document.getElementById('chat-button'); // REMOVED /* cite: 228 */
    // const chatPopup = document.getElementById('chat-popup'); // REMOVED /* cite: 229 */

    if (user) {
        if (userInfo) userInfo.textContent = `Olá, ${user.displayName || user.email}!`; /* cite: 230 */
        if (loginGoogleButton) loginGoogleButton.style.display = 'none'; /* cite: 231 */
        if (loginGitHubButton) loginGitHubButton.style.display = 'none'; /* cite: 232 */
        if (user.photoURL) {
            if (userProfilePic) {
                userProfilePic.src = user.photoURL; /* cite: 233 */
                userProfilePic.style.display = 'inline-block'; /* cite: 234 */
            }
        } else {
            if (userProfilePic) userProfilePic.style.display = 'none'; /* cite: 235 */
        }
        if (googleAppsButton) googleAppsButton.style.display = 'inline-block'; /* cite: 236 */
        if (userInfoContainer) userInfoContainer.style.display = 'flex'; /* cite: 237 */

        await createUserProfileDocument(user); /* cite: 238 */

        let isUserBanned = false; /* cite: 238 */
        try {
            const userProfileRef = firestore.collection('users').doc(user.uid); /* cite: 239 */
            const doc = await userProfileRef.get(); /* cite: 240 */

            if (doc.exists && doc.data()) {
                isUserBanned = doc.data().isBan || false; /* cite: 241 */
            }
        } catch (error) {
            console.error("Erro ao verificar perfil de usuário ou status de banimento:", error); /* cite: 242 */
            isUserBanned = false; /* cite: 243 */
        }

        isCurrentUserBanned = isUserBanned; /* cite: 244 */
        if (isUserBanned) {
            console.warn(`Usuário ${user.uid} está banido.`); /* cite: 245 */
            setNavLinksEnabled(false); /* cite: 246 */
            if (logoutButton) {
                logoutButton.style.display = 'none'; /* cite: 247 */
                logoutButton.removeEventListener('click', handleLogout); /* cite: 248 */
            }
            // A loadPage original aqui é usada para gerenciar o display das mensagens de acesso.
            // Para o caso de banimento, vamos garantir que a página de recepção seja exibida sem janela.
            if (contentFrame) {
                contentFrame.style.display = 'none'; // Esconde o iframe principal
            }
            if (bannedMessage) bannedMessage.style.display = 'block'; /* cite: 250 */
            if (accessDeniedMessage) accessDeniedMessage.style.display = 'none';

            // Oculta quaisquer janelas flutuantes se o usuário estiver banido
            document.querySelectorAll('.floating-window').forEach(win => win.remove());
            if (googleAppsButton) {
                googleAppsButton.style.pointerEvents = 'none'; /* cite: 252 */
                googleAppsButton.style.opacity = '0.6'; /* cite: 253 */
            }
            if (googleAppsPopup) googleAppsPopup.style.display = 'none'; /* cite: 254 */
            if (newsButton) newsButton.style.display = 'none'; /* cite: 255 */
            if (newsCenterPopup) newsCenterPopup.style.display = 'none'; /* cite: 256 */
            // if (chatButton) chatButton.style.display = 'none'; // REMOVED /* cite: 257 */
            // if (chatPopup) chatPopup.style.display = 'none'; // REMOVED /* cite: 258 */
        } else { // User is not banned
            if (logoutButton) logoutButton.style.display = 'inline-block'; /* cite: 259 */
            setNavLinksEnabled(true); // Enable all links if not banned /* cite: 260 */
            if (bannedMessage) bannedMessage.style.display = 'none'; /* cite: 261 */
            if (accessDeniedMessage) accessDeniedMessage.style.display = 'none'; /* cite: 263 */
            // contentFrame.style.display deve ser gerenciado pela função createFloatingWindow agora.
            // Garantir que não haja mensagem de acesso negado ou banido se o usuário está logado e não banido.
            if (googleAppsButton) {
                googleAppsButton.style.pointerEvents = 'auto'; /* cite: 264 */
                googleAppsButton.style.opacity = '1'; /* cite: 265 */
            }
            // if (notificationBellButton) notificationBellButton.style.display = 'inline-block'; // REMOVED /* cite: 266 */
            if (newsButton) newsButton.style.display = 'inline-block'; /* cite: 267 */
            // if (chatButton) chatButton.style.display = 'inline-block'; // REMOVED /* cite: 268 */

            await loadAndApplyUserAppsCSS(user.uid); /* cite: 269 */
            // listenForNotifications(); // REMOVED /* cite: 270 */

            // Carregar a página inicial na primeira janela flutuante se não houver nenhuma
            if (!document.querySelector('.floating-window')) {
                createFloatingWindow('recepcao.html', 'Recepção', false);
            }
        }
    } else { // Usuário deslogado
        currentUser = null; /* cite: 271 */
        if (userInfo) userInfo.textContent = ''; /* cite: 272 */
        if (loginGoogleButton) loginGoogleButton.style.display = 'inline-block'; /* cite: 273 */
        if (loginGitHubButton) loginGitHubButton.style.display = 'inline-block'; /* cite: 274 */
        if (logoutButton) logoutButton.style.display = 'none'; /* cite: 275 */
        isCurrentUserBanned = false; /* cite: 276 */
        if (bannedMessage) bannedMessage.style.display = 'none'; /* cite: 277 */
        setNavLinksEnabled(false); /* cite: 278 */
        // Oculta quaisquer janelas flutuantes e exibe a página de recepção sem janela
        document.querySelectorAll('.floating-window').forEach(win => win.remove());
        // Remover o iframe principal que já não deveria existir no fluxo de janelas flutuantes.
        // Aqui apenas garantimos que as mensagens de acesso sejam escondidas.
        if (contentFrame) contentFrame.style.display = 'none';
        if (accessDeniedMessage) accessDeniedMessage.style.display = 'none'; /* cite: 287 */
        // Reabre a recepcao em uma janela flutuante se não houver outra já aberta
        if (!document.querySelector('.floating-window')) {
            createFloatingWindow('recepcao.html', 'Recepção', false);
        }

        if (userProfilePic) {
            userProfilePic.style.display = 'none'; /* cite: 280 */
            userProfilePic.src = ''; /* cite: 281 */
        }
        if (googleAppsButton) googleAppsButton.style.display = 'none'; /* cite: 282 */
        if (userInfoContainer) userInfoContainer.style.display = 'none'; /* cite: 283 */
        if (googleAppsPopup) googleAppsPopup.style.display = 'none'; /* cite: 284 */
        if (customAppCssStyleTag) customAppCssStyleTag.innerHTML = ''; /* cite: 285 */
        if (contentFrame) contentFrame.style.display = 'block'; /* cite: 286 */
        // if (notificationBellButton) notificationBellButton.style.display = 'none'; // REMOVED /* cite: 288 */
        if (newsButton) newsButton.style.display = 'none'; /* cite: 289 */
        if (newsCenterPopup) newsCenterPopup.style.display = 'none'; /* cite: 290 */
        // if (chatButton) chatButton.style.display = 'none'; // REMOVED /* cite: 291 */
        // if (chatPopup) chatPopup.style.display = 'none'; // REMOVED /* cite: 292 */
        // updateNotificationBadge(0); // REMOVED /* cite: 293 */
        // if (unsubscribeNotifications) { // REMOVED /* cite: 294 */
        //     unsubscribeNotifications(); /* cite: 294 */
        //     unsubscribeNotifications = null; /* cite: 295 */
        // }
        // hideNotificationsPopup(); // REMOVED /* cite: 296 */
        hideNewsPopup(); /* cite: 297 */
        // hideChatPopup(); // REMOVED /* cite: 298 */
    }
    if (componentHandler) {
        componentHandler.upgradeDom(); /* cite: 299 */
    }
}); /* cite: 300 */

// --- Event Listeners DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // Re-obter referências aos elementos DOM dentro deste escopo
    const googleAppsButton = document.getElementById('google-apps-button');
    const googleAppsPopup = document.getElementById('google-apps-popup');
    // const notificationBellButton = document.getElementById('notification-bell-button'); // REMOVED /* cite: 301 */
    // const notificationsCenterPopup = document.getElementById('notifications-center-popup'); // REMOVED /* cite: 301 */
    // const closeNotificationsPopupButton = document.getElementById('close-notifications-popup-button'); // REMOVED /* cite: 301 */
    // const viewAllChatMessagesButton = document.getElementById('view-all-chat-messages-button'); // REMOVED /* cite: 301 */
    const navLinks = document.querySelectorAll('.mdl-navigation__link');

    // Get references for news popup elements (kept)
    const newsButton = document.getElementById('news-button'); /* cite: 302 */
    const newsCenterPopup = document.getElementById('news-center-popup'); /* cite: 303 */
    const closeNewsPopupButton = document.getElementById('close-news-popup-button'); /* cite: 304 */
    const viewAllNewsButton = document.getElementById('view-all-news-button'); /* cite: 305 */
    // Removidas referências para chat popup elements

    // --- Adicionar Event Listeners ---

    // Botão Google Apps (mantido, mas modificado)
    if (googleAppsButton) {
        googleAppsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que o clique se propague para o document /* cite: 306 */
            if (googleAppsPopup.style.display === 'block') {
                googleAppsPopup.style.display = 'none';
            } else {
                googleAppsPopup.style.display = 'block';
                loadUserApps(); // Função para carregar apps do usuário (se necessário)
            }
        });
    }

    // Fechar popups ao clicar fora
    document.addEventListener('click', (event) => {
        if (googleAppsPopup && googleAppsPopup.style.display === 'block' && !googleAppsPopup.contains(event.target) && !googleAppsButton.contains(event.target)) {
            googleAppsPopup.style.display = 'none';
        }
        if (newsCenterPopup && newsCenterPopup.style.display === 'flex' && !newsCenterPopup.contains(event.target) && (!newsButton || !newsButton.contains(event.target))) {
            hideNewsPopup();
        }
        // if (notificationsCenterPopup && notificationsCenterPopup.style.display === 'flex' && !notificationsCenterPopup.contains(event.target) && (!notificationBellButton || !notificationBellButton.contains(event.target))) {
        //     hideNotificationsPopup();
        // }
        // if (chatPopup && chatPopup.style.display === 'flex' && !chatPopup.contains(event.target) && (!chatButton || !chatButton.contains(event.target))) {
        //     hideChatPopup();
        // }
    });

    // Botão Notícias (mantido)
    if (newsButton) {
        newsButton.addEventListener('click', showNewsPopup);
    }
    if (closeNewsPopupButton) {
        closeNewsPopupButton.addEventListener('click', hideNewsPopup);
    }
    if (viewAllNewsButton) {
        viewAllNewsButton.addEventListener('click', () => {
            createFloatingWindow('noticias.html', 'Todas as Notícias', false);
            hideNewsPopup();
        });
    }

    // --- Função para criar e gerenciar janelas flutuantes (ESSENCIAL) ---
    // Esta função substitui a lógica anterior de loadPage para o iframe principal.
    // Ela agora é responsável por criar, abrir, focar e carregar conteúdo em janelas.
    window.createFloatingWindow = function(url, title = 'Nova Janela', requiresAuth = false, windowId = null) {
        if (requiresAuth && !currentUser) {
            document.getElementById('access-denied-message').style.display = 'block';
            setTimeout(() => {
                document.getElementById('access-denied-message').style.display = 'none';
            }, 3000);
            return;
        }

        if (isCurrentUserBanned) {
            document.getElementById('banned-message').style.display = 'block';
            setTimeout(() => {
                document.getElementById('banned-message').style.display = 'none';
            }, 3000);
            return;
        }

        const container = document.getElementById('window-container');
        let windowElement;

        // Se um windowId for fornecido, tenta encontrar uma janela existente
        if (windowId) {
            windowElement = document.getElementById(windowId);
        }

        if (!windowElement) {
            // Cria uma nova janela se não existir ou se não houver windowId
            windowId = windowId || `window-${Date.now()}`; // Garante um ID único
            windowElement = document.createElement('div');
            windowElement.id = windowId;
            windowElement.className = 'floating-window mdl-card mdl-shadow--8dp';
            windowElement.innerHTML = `
                <div class="window-header">
                    <span class="window-title">${title}</span>
                    <div class="window-controls">
                        <button class="minimize-button material-icons">remove</button>
                        <button class="maximize-button material-icons">crop_square</button>
                        <button class="close-button material-icons">close</button>
                    </div>
                </div>
                <div class="window-body">
                    <iframe src="${url}" frameborder="0"></iframe>
                </div>
            `;
            container.appendChild(windowElement);

            const header = windowElement.querySelector('.window-header');
            const iframe = windowElement.querySelector('iframe');
            const closeButton = windowElement.querySelector('.close-button');
            const minimizeButton = windowElement.querySelector('.minimize-button');
            const maximizeButton = windowElement.querySelector('.maximize-button');
            let isDragging = false;
            let offsetX, offsetY;
            let isMaximized = false;
            let originalRect = {};

            // Trazer a janela para a frente ao clicar
            windowElement.addEventListener('mousedown', () => {
                // Remove a classe 'active-window' de todas as janelas
                document.querySelectorAll('.floating-window').forEach(win => {
                    win.classList.remove('active-window');
                    win.style.zIndex = 999; // Reset z-index
                });
                // Adiciona a classe 'active-window' e define um z-index maior para a janela clicada
                windowElement.classList.add('active-window');
                windowElement.style.zIndex = 1000;
            });

            header.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - windowElement.getBoundingClientRect().left;
                offsetY = e.clientY - windowElement.getBoundingClientRect().top;
                windowElement.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                windowElement.style.cursor = 'grab';
            });

            closeButton.addEventListener('click', () => {
                windowElement.remove();
                // Se a recepcao.html estava aberta em uma janela e for fechada, reabrir
                if (url === 'recepcao.html' && !document.querySelector('.floating-window')) {
                    createFloatingWindow('recepcao.html', 'Recepção', false);
                }
            });

            minimizeButton.addEventListener('click', () => {
                windowElement.style.height = '48px'; // Altura da barra de título
                iframe.style.display = 'none';
                minimizeButton.textContent = 'add_box'; // Altera ícone para restaurar
                minimizeButton.classList.replace('minimize-button', 'restore-minimize-button');
            });

            // Lidar com o botão de restaurar (depois de minimizar)
            windowElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('restore-minimize-button')) {
                    windowElement.style.height = originalRect.height ? `${originalRect.height}px` : '450px'; // Restaura altura ou padrão
                    iframe.style.display = 'flex';
                    e.target.textContent = 'remove'; // Altera ícone de volta para minimizar
                    e.target.classList.replace('restore-minimize-button', 'minimize-button');
                }
            });

            maximizeButton.addEventListener('click', () => {
                if (!isMaximized) {
                    originalRect = {
                        top: windowElement.style.top,
                        left: windowElement.style.left,
                        width: windowElement.style.width,
                        height: windowElement.style.height,
                        transform: windowElement.style.transform // Preserve transform if any
                    };

                    windowElement.style.top = '0';
                    windowElement.style.left = '0';
                    windowElement.style.width = '100%';
                    windowElement.style.height = '100%';
                    windowElement.style.transform = 'none'; // Remove any transformations
                    windowElement.style.resize = 'none'; // Desabilita o redimensionamento
                    maximizeButton.textContent = 'filter_none'; // Altera ícone para restaurar
                    isMaximized = true;
                } else {
                    windowElement.style.top = originalRect.top;
                    windowElement.style.left = originalRect.left;
                    windowElement.style.width = originalRect.width;
                    windowElement.style.height = originalRect.height;
                    windowElement.style.transform = originalRect.transform;
                    windowElement.style.resize = 'both'; // Habilita o redimensionamento
                    maximizeButton.textContent = 'crop_square'; // Altera ícone para maximizar
                    isMaximized = false;
                }
            });

            // Define o título inicial da janela
            const windowTitleSpan = windowElement.querySelector('.window-title');
            if (windowTitleSpan) {
                windowTitleSpan.textContent = title;
            }

        } else {
            // Se a janela já existe, apenas traga-a para a frente e atualize o URL se for diferente
            document.querySelectorAll('.floating-window').forEach(win => {
                win.classList.remove('active-window');
                win.style.zIndex = 999;
            });
            windowElement.classList.add('active-window');
            windowElement.style.zIndex = 1000;

            const iframe = windowElement.querySelector('iframe');
            if (iframe && iframe.src !== url) {
                iframe.src = url;
            }
            const windowTitleSpan = windowElement.querySelector('.window-title');
            if (windowTitleSpan) {
                windowTitleSpan.textContent = title;
            }
        }
    };


    // Event listener para links de navegação usando a nova função createFloatingWindow
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Impede a navegação padrão
            const href = link.getAttribute('onclick').match(/'(.*?)'/)[1]; // Extrai o href
            const requiresAuth = link.getAttribute('data-requires-auth') === 'true';
            const label = link.textContent;
            createFloatingWindow(href, label, requiresAuth);
        });
    });

    // --- Carregar menu de navegação do Firestore ---
    const drawerMenu = document.getElementById('drawer-menu');

    firestore.collection('menus').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('Nenhum item de menu encontrado na coleção "menus".');
                return;
            }
            snapshot.forEach(doc => {
                const item = doc.data();
                const a = document.createElement('a');
                a.className = 'mdl-navigation__link';
                a.href = '#'; // A navegação será controlada pelo onclick
                a.setAttribute('onclick', `createFloatingWindow('${item.href}', '${item.label}', ${item.requiresAuth || false})`);

                if (item.requiresAuth) {
                    a.setAttribute('data-requires-auth', 'true');
                }
                a.textContent = item.label;
                drawerMenu.appendChild(a);
            });
            // Re-upgrade the DOM to apply MDL styles to newly added elements
            if (componentHandler) {
                componentHandler.upgradeElement(drawerMenu);
            }
        })
        .catch(err => {
            console.error('Erro ao carregar menu do Firestore:', err);
        });
});
</script>
