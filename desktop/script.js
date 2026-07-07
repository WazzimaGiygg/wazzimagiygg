// ============================================
// SISTEMA DE COOKIES OBRIGATÓRIOS
// ============================================
const cookieOverlay = document.getElementById('cookieOverlay');
const acceptCookiesBtn = document.getElementById('acceptCookies');
const rejectCookiesBtn = document.getElementById('rejectCookies');

// Verificar se o usuário já aceitou os cookies
function hasAcceptedCookies() {
    return localStorage.getItem('cookiesAccepted') === 'true' || 
           sessionStorage.getItem('cookiesAccepted') === 'true';
}

// Aceitar cookies e continuar
function acceptCookies() {
    // Armazenar consentimento (em localStorage e sessionStorage para redundância)
    localStorage.setItem('cookiesAccepted', 'true');
    sessionStorage.setItem('cookiesAccepted', 'true');
    
    // Ocultar o aviso com animação
    cookieOverlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        cookieOverlay.style.display = 'none';
        
        // Mostrar tela de login
        document.getElementById('login-screen').style.display = 'flex';
    }, 300);
    
    console.log('🍪 Cookies aceitos pelo usuário');
}

// Inicializar verificação de cookies
function initializeCookieCheck() {
    // Se já aceitou, ocultar aviso e mostrar login diretamente
    if (hasAcceptedCookies()) {
        cookieOverlay.style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        console.log('🍪 Consentimento de cookies já existente');
    } else {
        // Mostrar aviso de cookies
        cookieOverlay.style.display = 'flex';
        document.getElementById('login-screen').style.display = 'none';
        console.log('🍪 Aguardando consentimento de cookies');
    }
}

// Event listeners para botões de cookies
acceptCookiesBtn.addEventListener('click', acceptCookies);

// Botão de rejeitar permanece desabilitado visualmente
rejectCookiesBtn.addEventListener('click', () => {
    alert('⚠️ Os cookies são obrigatórios para o funcionamento do sistema. Por favor, clique em "Entendi e Continuar" para prosseguir.');
});

// Bloquear interação com o resto da página até aceitar cookies
document.addEventListener('click', function(e) {
    if (!hasAcceptedCookies() && !e.target.closest('.cookie-notice')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);

// ============================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    getDoc,
    setDoc,
    updateDoc
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260",
    measurementId: "G-PLKNZNFCQ8"
};

try {
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase inicializado com sucesso");
} catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// ============================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================
const KEY_ARRAY_FIELD = "itens_menu";
const JSON_URL = 'https://wazzimagiygg.com/cidades_sancionadas.json';
const GRID_SIZE = 16;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const DESKTOP_COLLECTION = "desktop";

// ============================================
// LINKS ESTÁTICOS COM IDENTIFICADORES
// ============================================
const staticStartLinks = [
    { 
        id: 'termos-servico',
        name: '📄 Termos de Serviço', 
        url: 'https://wazzimagiygg.com/pdf/?uid=Termos%20de%20Servi%C3%A7o.pdf',
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'politica-privacidade',
        name: '🔒 Política de Privacidade', 
        url: 'https://wazzimagiygg.com/pdf/?uid=Pol%C3%ADtica%20de%20Privacidade.pdf', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'fale-admin',
        name: '💬 Fale com a Administração', 
        url: 'html/?uid=a13IwrEoc1Jmdi2I3Hve', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'gerenciador-gespai',
        name: '⚙️ Gerenciador GESPAI', 
        url: 'https://wazzimagiygg.com/gespai/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'doacao',
        name: '📄 Faça uma doação! ', 
        url: 'https://wazzimagiygg.com/donate/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'privacidade',
        name: '🚪 Compromisso com sua privacidade. O que não te contaram sobre a Wikipédia', 
        url: 'https://wazzimagiygg.com/admin/privacidade/compromisso/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    },
    { 
        id: 'logout',
        name: '🚪 Sair do Sistema', 
        action: 'logout', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'menu_iniciar' 
    }
];

const staticAdminLinks = [
    { 
        id: 'criptografia-texto',
        name: '📝 Criptografia de Texto', 
        url: 'https://ciphersafex.wazzimagiygg.com', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'wiki_pedia' 
    },
    { 
        id: 'editor-quill',
        name: '📄 Editor Quill Sync', 
        url: 'https://quill-sync.wazzimagiygg.com/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'wiki_pedia' 
    },
    { 
        id: 'tab-writer',
        name: '📊 Tab Writer', 
        url: 'https://tabwriter.wazzimagiygg.com/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'wiki_pedia' 
    },
    { 
        id: 'encrypto-json',
        name: '🔒 Encrypto JSON', 
        url: 'https://encryptojson.wazzimagiygg.com/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'wiki_pedia' 
    },
    { 
        id: 'bibliotecas-estudo',
        name: '📚 Bibliotecas de Estudo', 
        url: 'https://wazzimagiygg.com/bibliotecas/', 
        iconUrl: 'https://wazzimagiygg.com/iconmagic.png', 
        menu_target: 'wiki_pedia' 
    },
    { 
        id: 'chat-contato',
        name: "💬 Chat (Contato)", 
        url: "html/?uid=a13IwrEoc1Jmdi2I3Hve", 
        menu_target: 'wiki_pedia' 
    }
];

// ============================================
// ELEMENTOS DO DOM
// ============================================
const loginScreen = document.getElementById("login-screen");
const loginBtn = document.getElementById("loginBtn");
const desktop = document.getElementById("desktop");
const desktopArea = document.getElementById("desktop-area");

// Menus e taskbar
const startMenu = document.getElementById("startMenu");
const adminMenu = document.getElementById("adminMenu");
const toolsMenu = document.getElementById("toolsMenu");
const userMenu = document.getElementById("userMenu");
const notificationIcon = document.getElementById("notificationIcon");
const notificationPopup = document.getElementById("notificationPopup");
const menuOverlay = document.getElementById("menuOverlay");
const taskbarIcons = document.getElementById("taskbarIcons");
const showAllBtn = document.getElementById("showAllBtn");
const clockElement = document.getElementById("clock");

// Botões da taskbar
const startBtn = document.getElementById("startBtn");
const adminBtn = document.getElementById("adminBtn");
const toolsBtn = document.getElementById("toolsBtn");

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let currentUser = null;
let desktopIcons = [];
let draggedIconId = null;
let saveTimeout = null;
let hasUnsavedChanges = false;
let dynamicLinks = {
    all: [],
    iniciar: [],
    admin: [],
    ferramentas: []
};

// ============================================
// GESTOR DE CARREGAMENTO ASSÍNCRONO
// ============================================
const loadingManager = {
    isFirebaseLoaded: false,
    uidQueue: null,
    onFirebaseLoadedCallbacks: [],
    
    markFirebaseLoaded: function() {
        this.isFirebaseLoaded = true;
        console.log("✅ Firebase carregado, processando callbacks...");
        
        this.onFirebaseLoadedCallbacks.forEach(callback => callback());
        this.onFirebaseLoadedCallbacks = [];
        
        if (this.uidQueue) {
            this.processQueuedUid();
        }
    },
    
    onFirebaseLoaded: function(callback) {
        if (this.isFirebaseLoaded) {
            callback();
        } else {
            this.onFirebaseLoadedCallbacks.push(callback);
        }
    },
    
    queueUid: function(uidValue) {
        this.uidQueue = uidValue;
        console.log(`📥 UID enfileirado: ${uidValue}`);
        
        if (this.isFirebaseLoaded) {
            this.processQueuedUid();
        } else {
            console.log("⏳ Aguardando carregamento do Firebase...");
        }
    },
    
    processQueuedUid: function() {
        if (!this.uidQueue) return;
        
        const uidValue = this.uidQueue;
        console.log(`🎯 Processando UID da fila: ${uidValue}`);
        
        urlParamsProcessor.processUidParam(uidValue);
        this.uidQueue = null;
    }
};

// ============================================
// PROCESSADOR DE PARÂMETROS URL
// ============================================
const urlParamsProcessor = {
    getUidParam: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('uid');
    },
    
    processUidParam: function(uidValue) {
        if (!uidValue) return false;
        
        console.log(`🔍 Processando UID: ${uidValue}`);
        
        const staticLink = this.findInStaticLinks(uidValue);
        if (staticLink) {
            this.openLink(staticLink);
            return true;
        }
        
        const dynamicLink = this.findInDynamicLinks(uidValue);
        if (dynamicLink) {
            this.openLink(dynamicLink);
            return true;
        }
        
        console.log(`❓ UID não encontrado em links, tentando como URL...`);
        this.openAsDirectUrl(uidValue);
        return false;
    },
    
    findInStaticLinks: function(uidValue) {
        const allStaticLinks = [
            ...staticStartLinks,
            ...staticAdminLinks
        ];
        
        return allStaticLinks.find(link => {
            if (link.id && link.id === uidValue) return true;
            
            if (link.url && this.extractUidFromUrl(link.url) === uidValue) return true;
            
            if (link.name && this.normalizeString(link.name) === this.normalizeString(uidValue)) {
                return true;
            }
            
            if (link.name && this.normalizeString(link.name).includes(this.normalizeString(uidValue))) {
                return true;
            }
            
            return false;
        });
    },
    
    findInDynamicLinks: function(uidValue) {
        if (!dynamicLinks.all || dynamicLinks.all.length === 0) {
            console.log("⚠️ Nenhum link dinâmico carregado ainda");
            return null;
        }
        
        console.log(`🔎 Buscando em ${dynamicLinks.all.length} links dinâmicos...`);
        
        return dynamicLinks.all.find(link => {
            if (link.name && this.normalizeString(link.name) === this.normalizeString(uidValue)) {
                console.log(`✅ Encontrado por título: ${link.name}`);
                return true;
            }
            
            if (link.url) {
                const extractedUid = this.extractUidFromUrl(link.url);
                if (extractedUid && extractedUid === uidValue) {
                    console.log(`✅ Encontrado por UID na URL: ${link.url}`);
                    return true;
                }
            }
            
            if (link.name && this.normalizeString(link.name).includes(this.normalizeString(uidValue))) {
                console.log(`✅ Encontrado por título parcial: ${link.name}`);
                return true;
            }
            
            if (link.url) {
                const fileName = this.extractFileNameFromUrl(link.url);
                if (fileName && this.normalizeString(fileName).includes(this.normalizeString(uidValue))) {
                    console.log(`✅ Encontrado por nome do arquivo: ${fileName}`);
                    return true;
                }
            }
            
            return false;
        });
    },
    
    extractUidFromUrl: function(url) {
        if (!url) return null;
        
        const uidMatch1 = url.match(/[?&]uid=([^&]+)/i);
        if (uidMatch1) return decodeURIComponent(uidMatch1[1]);
        
        const uidMatch2 = url.match(/\/(?:pdf|html)\/\?uid=([^&]+)/i);
        if (uidMatch2) return decodeURIComponent(uidMatch2[1]);
        
        const lastSegment = url.split('/').pop();
        if (lastSegment && lastSegment.includes('?')) {
            return lastSegment.split('?')[0];
        }
        
        return lastSegment || null;
    },
    
    extractFileNameFromUrl: function(url) {
        if (!url) return null;
        
        const urlObj = new URL(url, window.location.origin);
        const pathname = urlObj.pathname;
        const fileName = pathname.split('/').pop();
        
        return fileName.replace(/\.[^/.]+$/, '');
    },
    
    normalizeString: function(str) {
        return str.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-')
            .trim();
    },
    
    openLink: function(link) {
        setTimeout(() => {
            windowManager.createWindow(
                link.name, 
                link.url, 
                link.iconUrl || 'https://wazzimagiygg.com/iconmagic.png'
            );
            console.log(`✅ Janela aberta: ${link.name}`);
            
            closeAllMenus();
        }, 300);
    },
    
    openAsDirectUrl: function(uidValue) {
        let finalUrl = uidValue;
        let windowTitle = 'Link Externo';
        
        if (!uidValue.startsWith('http')) {
            if (uidValue.includes('.pdf') || uidValue.includes('.html') || uidValue.includes('/')) {
                finalUrl = `https://wazzimagiygg.com/${uidValue}`;
                windowTitle = 'Documento';
            } else {
                finalUrl = `https://wazzimagiygg.com/pdf/?uid=${uidValue}`;
                windowTitle = 'Documento PDF';
            }
        }
        
        console.log(`🌐 Aberto como URL direta: ${finalUrl}`);
        
        setTimeout(() => {
            windowManager.createWindow(windowTitle, finalUrl, 'https://wazzimagiygg.com/iconmagic.png');
        }, 300);
    }
};

// ============================================
// VERIFICAR UID NA INICIALIZAÇÃO
// ============================================
const initialUid = urlParamsProcessor.getUidParam();
if (initialUid) {
    console.log(`🎯 UID detectado na inicialização: ${initialUid}`);
    
    const staticLink = urlParamsProcessor.findInStaticLinks(initialUid);
    
    if (staticLink) {
        console.log(`⚡ UID corresponde a link estático, será aberto após login`);
    } else {
        loadingManager.queueUid(initialUid);
    }
}

// ============================================
// GERENCIADOR DE DESKTOP
// ============================================
const desktopManager = {
    loadIcons: async function(userId) {
        try {
            const userDesktopRef = doc(db, DESKTOP_COLLECTION, userId);
            const userDocSnap = await getDoc(userDesktopRef);
            
            if (userDocSnap.exists()) {
                desktopIcons = userDocSnap.data().shortcuts || [];
                console.log(`📁 Carregados ${desktopIcons.length} atalhos do desktop`);
            } else {
                desktopIcons = [];
                await setDoc(userDesktopRef, { shortcuts: [] });
                console.log("📁 Criado novo desktop para usuário");
            }
            
            this.renderIcons();
        } catch (error) {
            console.error("❌ Erro ao carregar atalhos do desktop:", error);
            desktopIcons = [];
            this.renderIcons();
        }
    },
    
    saveIcons: async function() {
        if (!currentUser) {
            console.log("⚠️ Usuário não autenticado, não é possível salvar");
            return;
        }
        
        try {
            const userDesktopRef = doc(db, DESKTOP_COLLECTION, currentUser.uid);
            await updateDoc(userDesktopRef, { shortcuts: desktopIcons });
            console.log("💾 Atalhos do desktop salvos");
            hasUnsavedChanges = false;
            
            this.showSaveNotification("Desktop salvo!");
        } catch (error) {
            console.error("❌ Erro ao salvar atalhos:", error);
            this.showSaveNotification("Erro ao salvar!", true);
        }
    },
    
    showSaveNotification: function(message = "Salvando...", isError = false) {
        const existingNotification = document.querySelector('.save-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `save-notification ${isError ? 'error' : ''}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            background: ${isError ? '#ff6b6b' : '#4CAF50'};
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 2000);
    },
    
    renderIcons: function() {
        desktopArea.innerHTML = '';
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'desktop-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.style.gridColumn = x + 1;
                cell.style.gridRow = y + 1;
                
                const icon = desktopIcons.find(icon => 
                    icon.position && 
                    icon.position.x === x && 
                    icon.position.y === y
                );
                
                if (icon) {
                    const iconElement = document.createElement('div');
                    iconElement.className = 'desktop-icon';
                    iconElement.draggable = true;
                    iconElement.dataset.id = icon.id;
                    iconElement.innerHTML = `
                        <img src="${icon.icon || 'https://wazzimagiygg.com/iconmagic.png'}" alt="${icon.title}">
                        <span>${icon.title}</span>
                    `;
                    
                    iconElement.addEventListener('dragstart', (e) => {
                        draggedIconId = icon.id;
                        iconElement.classList.add('dragging');
                        e.dataTransfer.setData('text/plain', icon.id);
                    });
                    
                    iconElement.addEventListener('dragend', () => {
                        iconElement.classList.remove('dragging');
                        draggedIconId = null;
                    });
                    
                    iconElement.addEventListener('click', (e) => {
                        if (e.button === 0) {
                            this.openShortcut(icon);
                        }
                    });
                    
                    iconElement.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showIconContextMenu(e, icon);
                    });
                    
                    cell.appendChild(iconElement);
                }
                
                desktopArea.appendChild(cell);
            }
        }
    },
    
    addEmptyShortcut: function() {
        const emptyPosition = this.findEmptyPosition();
        if (!emptyPosition) {
            alert("❌ Não há espaço disponível no desktop (16x16 slots ocupados)");
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3>➕ Adicionar Novo Atalho</h3>
                <input type="text" id="shortcutTitle" class="modal-input" placeholder="Título do Atalho" autofocus>
                <input type="text" id="shortcutUrl" class="modal-input" placeholder="URL (ex: https://...)">
                <input type="text" id="shortcutIcon" class="modal-input" placeholder="URL do Ícone (opcional)">
                
                <div class="modal-buttons">
                    <button class="modal-button secondary" id="cancelBtn">Cancelar</button>
                    <button class="modal-button primary" id="saveBtn">Salvar Atalho</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        modal.querySelector('#cancelBtn').onclick = () => {
            modal.remove();
        };
        
        modal.querySelector('#saveBtn').onclick = () => {
            const title = modal.querySelector('#shortcutTitle').value.trim();
            const url = modal.querySelector('#shortcutUrl').value.trim();
            const icon = modal.querySelector('#shortcutIcon').value.trim() || 'https://wazzimagiygg.com/iconmagic.png';
            
            if (!title || !url) {
                alert("❌ Por favor, preencha título e URL");
                return;
            }
            
            this.addShortcutFromUrl(title, url, icon);
            modal.remove();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    },
    
    addShortcutFromUrl: function(title, url, iconUrl = 'https://wazzimagiygg.com/iconmagic.png') {
        const emptyPosition = this.findEmptyPosition();
        if (!emptyPosition) {
            alert("❌ Não há espaço disponível no desktop");
            return;
        }
        
        const newIcon = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: title,
            url: url,
            icon: iconUrl,
            position: emptyPosition,
            createdAt: new Date().toISOString(),
            type: 'custom'
        };
        
        desktopIcons.push(newIcon);
        this.saveIcons();
        this.renderIcons();
        
        console.log(`➕ Atalho customizado adicionado: ${title}`);
    },
    
    addDynamicShortcut: function(link) {
        const emptyPosition = this.findEmptyPosition();
        if (!emptyPosition) {
            alert("❌ Não há espaço disponível no desktop");
            return;
        }
        
        const newIcon = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: link.name,
            url: link.url,
            icon: link.iconUrl || 'https://wazzimagiygg.com/iconmagic.png',
            position: emptyPosition,
            createdAt: new Date().toISOString(),
            type: 'dynamic',
            originalData: link
        };
        
        desktopIcons.push(newIcon);
        this.saveIcons();
        this.renderIcons();
        
        console.log(`➕ Atalho dinâmico adicionado: ${link.name}`);
    },
    
    findEmptyPosition: function() {
        const occupiedPositions = desktopIcons
            .filter(icon => icon.position)
            .map(icon => `${icon.position.x},${icon.position.y}`);
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!occupiedPositions.includes(`${x},${y}`)) {
                    return { x, y };
                }
            }
        }
        return null;
    },
    
    moveIcon: function(iconId, newPosition) {
        const iconIndex = desktopIcons.findIndex(icon => icon.id === iconId);
        if (iconIndex !== -1) {
            const occupied = desktopIcons.some((icon, index) => 
                index !== iconIndex &&
                icon.position && 
                icon.position.x === newPosition.x && 
                icon.position.y === newPosition.y
            );
            
            if (!occupied) {
                desktopIcons[iconIndex].position = newPosition;
                this.saveIcons();
                this.renderIcons();
                console.log(`➡️ Ícone movido para ${newPosition.x},${newPosition.y}`);
                return true;
            } else {
                console.log("❌ Posição já ocupada");
                return false;
            }
        }
        return false;
    },
    
    removeIcon: function(iconId) {
        desktopIcons = desktopIcons.filter(icon => icon.id !== iconId);
        this.saveIcons();
        this.renderIcons();
        console.log("🗑️ Ícone removido");
    },
    
    openShortcut: function(icon) {
        if (icon.url) {
            windowManager.createWindow(icon.title, icon.url, icon.icon);
        } else {
            const url = `https://wazzimagiygg.com/central/uid/?uid=${icon.uid}&collection=${icon.collection}`;
            windowManager.createWindow(icon.title, url, icon.icon);
        }
    },
    
    showDesktopContextMenu: function(e, x, y) {
        e.preventDefault();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" id="addCustomShortcutBtn">
                <img src="https://wazzimagiygg.com/iconmagic.png" alt="➕"> Adicionar Atalho Customizado
            </div>
            <div class="context-menu-item" id="addDynamicShortcutBtn">
                <img src="https://wazzimagiygg.com/iconmagic.png" alt="📚"> Adicionar dos Links Dinâmicos
            </div>
            <hr style="margin: 5px 0; border-color: rgba(255,255,255,0.1);">
            <div class="context-menu-item" id="refreshDesktopBtn">
                <img src="https://wazzimagiygg.com/iconmagic.png" alt="🔄"> Atualizar Desktop
            </div>
        `;
        
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.style.display = 'block';
        
        document.body.appendChild(menu);
        
        menu.querySelector('#addCustomShortcutBtn').onclick = () => {
            this.addEmptyShortcut();
            menu.remove();
        };
        
        menu.querySelector('#addDynamicShortcutBtn').onclick = async () => {
            await this.showDynamicLinksModal();
            menu.remove();
        };
        
        menu.querySelector('#refreshDesktopBtn').onclick = () => {
            this.renderIcons();
            menu.remove();
        };
        
        setTimeout(() => {
            const closeMenu = () => {
                if (menu.parentNode) {
                    menu.remove();
                }
                document.removeEventListener('click', closeMenu);
            };
            document.addEventListener('click', closeMenu, { once: true });
        }, 100);
    },
    
    showIconContextMenu: function(e, icon) {
        e.preventDefault();
        e.stopPropagation();
        
        const iconContextMenu = document.createElement('div');
        iconContextMenu.className = 'context-menu';
        iconContextMenu.innerHTML = `
            <div class="context-menu-item open-icon">
                <img src="https://wazzimagiygg.com/iconmagic.png" alt="▶️"> Abrir
            </div>
            <div class="context-menu-item remove-icon">
                <img src="https://wazzimagiygg.com/iconmagic.png" alt="🗑️"> Remover
            </div>
        `;
        
        iconContextMenu.style.left = e.clientX + 'px';
        iconContextMenu.style.top = e.clientY + 'px';
        iconContextMenu.style.display = 'block';
        
        iconContextMenu.querySelector('.open-icon').onclick = () => {
            this.openShortcut(icon);
            iconContextMenu.remove();
        };
        
        iconContextMenu.querySelector('.remove-icon').onclick = () => {
            this.removeIcon(icon.id);
            iconContextMenu.remove();
        };
        
        document.body.appendChild(iconContextMenu);
        
        setTimeout(() => {
            const removeMenu = () => {
                if (iconContextMenu.parentNode) {
                    iconContextMenu.remove();
                }
                document.removeEventListener('click', removeMenu);
            };
            document.addEventListener('click', removeMenu, { once: true });
        }, 100);
    },
    
    showDynamicLinksModal: async function() {
        try {
            if (dynamicLinks.all.length === 0) {
                alert("⚠️ Nenhum link dinâmico disponível no momento");
                return;
            }
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal" style="max-width: 600px; max-height: 70vh; overflow: hidden; display: flex; flex-direction: column;">
                    <h3>📚 Adicionar Atalho dos Links Dinâmicos</h3>
                    <div style="flex: 1; overflow-y: auto; margin-bottom: 20px;">
                        <div id="dynamicLinksList" style="display: grid; gap: 8px;"></div>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-button secondary" id="cancelModalBtn">Cancelar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'flex';
            
            const linksList = modal.querySelector('#dynamicLinksList');
            dynamicLinks.all.forEach(link => {
                const linkElement = document.createElement('div');
                linkElement.className = 'context-menu-item';
                linkElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    cursor: pointer;
                    border-radius: 8px;
                    margin: 2px 0;
                    background: rgba(255,255,255,0.05);
                `;
                linkElement.innerHTML = `
                    <img src="${link.iconUrl || 'https://wazzimagiygg.com/iconmagic.png'}" alt="icon" style="width: 24px; height: 24px; margin-right: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${link.name}</div>
                        <div style="font-size: 12px; opacity: 0.7; word-break: break-all;">${link.url.substring(0, 60)}${link.url.length > 60 ? '...' : ''}</div>
                        <div style="font-size: 11px; opacity: 0.5;">Categoria: ${link.menu_target}</div>
                    </div>
                    <button class="add-link-btn" style="background: #0078d7; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                        Adicionar
                    </button>
                `;
                
                linkElement.querySelector('.add-link-btn').onclick = (e) => {
                    e.stopPropagation();
                    this.addDynamicShortcut(link);
                    modal.remove();
                };
                
                linkElement.onclick = (e) => {
                    if (!e.target.closest('.add-link-btn')) {
                        windowManager.createWindow(link.name, link.url, link.iconUrl);
                        modal.remove();
                    }
                };
                
                linksList.appendChild(linkElement);
            });
            
            modal.querySelector('#cancelModalBtn').onclick = () => {
                modal.remove();
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            };
            
        } catch (error) {
            console.error("❌ Erro ao carregar links dinâmicos:", error);
            alert("❌ Erro ao carregar links dinâmicos");
        }
    },
    
    forceSave: function() {
        return this.saveIcons();
    }
};

// ============================================
// EVENTOS DE DRAG AND DROP DO DESKTOP
// ============================================
desktopArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const cell = e.target.closest('.desktop-cell');
    if (cell) {
        document.querySelectorAll('.desktop-cell').forEach(c => {
            c.classList.remove('drag-over');
        });
        cell.classList.add('drag-over');
    }
});

desktopArea.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget || !desktopArea.contains(e.relatedTarget)) {
        document.querySelectorAll('.desktop-cell').forEach(c => {
            c.classList.remove('drag-over');
        });
    }
});

desktopArea.addEventListener('drop', (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.desktop-cell').forEach(c => {
        c.classList.remove('drag-over');
    });
    
    if (!draggedIconId) return;
    
    const cell = e.target.closest('.desktop-cell');
    if (cell) {
        const newX = parseInt(cell.dataset.x);
        const newY = parseInt(cell.dataset.y);
        
        const moved = desktopManager.moveIcon(draggedIconId, { x: newX, y: newY });
        
        if (!moved) {
            cell.style.animation = 'shake 0.5s';
            setTimeout(() => {
                cell.style.animation = '';
            }, 500);
        }
    }
});

desktopArea.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('.desktop-cell');
    if (cell && !e.target.closest('.desktop-icon')) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        desktopManager.showDesktopContextMenu(e, x, y);
    }
});

// ============================================
// GERENCIADOR DE JANELAS
// ============================================
const windowManager = {
    windows: [],
    activeWindow: null,
    
    createWindow: function(title, url, icon = 'https://wazzimagiygg.com/iconmagic.png') {
        const win = document.createElement("div");
        win.className = "window";
        win.innerHTML = `
            <div class="window-header">
                <span>${title}</span>
                <div class="window-controls">
                    <button class="minimize" title="Minimizar">—</button>
                    <button class="maximize" title="Maximizar">⬜</button>
                    <button class="close" title="Fechar">✖</button>
                </div>
            </div>
            <iframe src="${url}" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
        `;
        
        document.body.appendChild(win);

        const header = win.querySelector(".window-header");
        let isDragging = false;
        let offsetX, offsetY;
        let maximized = false;
        let prevState = {};

        const windowId = this.addWindow(win, title, icon, url);
        
        win.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setActiveWindow(windowId);
            this.bringToFront(win);
        });

        header.addEventListener("mousedown", (e) => {
            if (maximized) return;
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            e.stopPropagation();
            this.setActiveWindow(windowId);
            this.bringToFront(win);
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging && !maximized) {
                win.style.left = (e.clientX - offsetX) + "px";
                win.style.top = (e.clientY - offsetY) + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        win.querySelector(".close").onclick = (e) => {
            e.stopPropagation();
            this.removeWindow(windowId);
            win.remove();
        };
        
        win.querySelector(".minimize").onclick = (e) => {
            e.stopPropagation();
            this.minimizeWindow(windowId);
        };
        
        win.querySelector(".maximize").onclick = (e) => {
            e.stopPropagation();
            if (!maximized) {
                prevState = {
                    top: win.offsetTop,
                    left: win.offsetLeft,
                    width: win.offsetWidth,
                    height: win.offsetHeight
                };
                
                win.style.top = "0";
                win.style.left = "0";
                win.style.width = "100%";
                win.style.height = "calc(100% - 40px)";
                maximized = true;
            } else {
                win.style.top = prevState.top + "px";
                win.style.left = prevState.left + "px";
                win.style.width = prevState.width + "px";
                win.style.height = prevState.height + "px";
                maximized = false;
            }
            this.bringToFront(win);
        };
        
        return windowId;
    },
    
    addWindow: function(windowElement, title, icon = 'https://wazzimagiygg.com/iconmagic.png', url) {
        const windowId = 'window_' + Date.now() + Math.random().toString(36).substr(2, 9);
        windowElement.dataset.windowId = windowId;
        
        const windowData = {
            id: windowId,
            element: windowElement,
            title: title,
            icon: icon,
            url: url,
            minimized: false,
            taskbarIcon: null
        };
        
        this.windows.push(windowData);
        this.setActiveWindow(windowId);
        this.createTaskbarIcon(windowData);
        
        return windowId;
    },
    
    removeWindow: function(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index !== -1) {
            const windowData = this.windows[index];
            
            if (windowData.taskbarIcon) {
                windowData.taskbarIcon.remove();
            }
            
            this.windows.splice(index, 1);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = this.windows.length > 0 ? this.windows[this.windows.length - 1].id : null;
                this.updateActiveWindow();
            }
        }
    },
    
    minimizeWindow: function(windowId) {
        const windowData = this.windows.find(w => w.id === windowId);
        if (windowData) {
            windowData.minimized = true;
            windowData.element.classList.add('minimized');
            this.updateTaskbarIcon(windowData);
            
            if (this.activeWindow === windowId) {
                const visibleWindows = this.windows.filter(w => !w.minimized && w.id !== windowId);
                if (visibleWindows.length > 0) {
                    this.setActiveWindow(visibleWindows[0].id);
                } else {
                    this.activeWindow = null;
                    this.updateActiveWindow();
                }
            }
        }
    },
    
    restoreWindow: function(windowId) {
        const windowData = this.windows.find(w => w.id === windowId);
        if (windowData) {
            windowData.minimized = false;
            windowData.element.classList.remove('minimized');
            this.setActiveWindow(windowId);
            this.updateTaskbarIcon(windowData);
            this.bringToFront(windowData.element);
        }
    },
    
    setActiveWindow: function(windowId) {
        this.activeWindow = windowId;
        this.updateActiveWindow();
        
        this.windows.forEach(windowData => {
            this.updateTaskbarIcon(windowData);
        });
    },
    
    updateActiveWindow: function() {
        this.windows.forEach(windowData => {
            const isActive = windowData.id === this.activeWindow;
            windowData.element.classList.toggle('active', isActive);
            if (windowData.taskbarIcon) {
                windowData.taskbarIcon.classList.toggle('active', isActive);
            }
        });
    },
    
    createTaskbarIcon: function(windowData) {
        const icon = document.createElement('button');
        icon.className = 'taskbar-icon';
        icon.title = windowData.title;
        icon.innerHTML = `<img src="${windowData.icon}" alt="icon"> <span>${windowData.title.substring(0, 20)}${windowData.title.length > 20 ? '...' : ''}</span>`;
        
        icon.onclick = (e) => {
            e.stopPropagation();
            if (windowData.minimized) {
                this.restoreWindow(windowData.id);
            } else {
                if (this.activeWindow === windowData.id) {
                    this.minimizeWindow(windowData.id);
                } else {
                    this.setActiveWindow(windowData.id);
                }
            }
        };
        
        icon.ondblclick = (e) => {
            e.stopPropagation();
            if (windowData.minimized) {
                this.restoreWindow(windowData.id);
            } else {
                this.minimizeWindow(windowData.id);
            }
        };
        
        taskbarIcons.appendChild(icon);
        windowData.taskbarIcon = icon;
        this.updateTaskbarIcon(windowData);
    },
    
    updateTaskbarIcon: function(windowData) {
        if (windowData.taskbarIcon) {
            windowData.taskbarIcon.style.opacity = windowData.minimized ? '0.7' : '1';
        }
    },
    
    bringToFront: function(windowElement) {
        const allWindows = document.querySelectorAll('.window');
        let maxZIndex = 100;
        
        allWindows.forEach(win => {
            const zIndex = parseInt(window.getComputedStyle(win).zIndex) || 100;
            if (zIndex > maxZIndex) maxZIndex = zIndex;
        });
        
        windowElement.style.zIndex = maxZIndex + 1;
    },
    
    showAllWindows: function() {
        this.windows.forEach(windowData => {
            if (windowData.minimized) {
                this.restoreWindow(windowData.id);
            }
        });
    },
    
    minimizeAllWindows: function() {
        this.windows.forEach(windowData => {
            if (!windowData.minimized) {
                this.minimizeWindow(windowData.id);
            }
        });
    },
    
    closeAllWindows: function() {
        const windowsToClose = [...this.windows];
        windowsToClose.forEach(windowData => {
            windowData.element.remove();
        });
        this.windows = [];
        this.activeWindow = null;
        taskbarIcons.innerHTML = '';
    }
};

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================
function closeAllMenus() {
    const menus = [startMenu, adminMenu, toolsMenu, notificationPopup, userMenu];
    menus.forEach(menu => {
        menu.style.display = "none";
        menu.classList.remove('active');
    });
    menuOverlay.style.display = "none";
}

function setupMenuClickOutside(menuElement) {
    menuElement.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    menuOverlay.addEventListener('click', function() {
        closeAllMenus();
    });
}

// ============================================
// AUTENTICAÇÃO E LOGIN
// ============================================
loginBtn.addEventListener("click", async () => {
    // Verificar se já aceitou os cookies
    if (!hasAcceptedCookies()) {
        alert('⚠️ Você precisa aceitar o aviso de cookies para continuar.');
        return;
    }
    
    try {
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Login bem-sucedido:", result.user.email);
    } catch (error) {
        console.error("❌ Erro no login:", error);
        alert(`Erro no login: ${error.message}`);
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log("👤 Usuário autenticado:", user.email);
        
        loginScreen.style.display = "none";
        desktop.style.display = "block";
        
        await desktopManager.loadIcons(user.uid);
        
        updateClock();
        await loadDynamicLinks(user.uid);
        populateUserMenu(user.displayName, user.email, user.photoURL);
        
        await checkNotifications();
        
        desktopManager.saveIcons();
        
    } else {
        currentUser = null;
        // Só mostrar login se já aceitou cookies
        if (hasAcceptedCookies()) {
            loginScreen.style.display = "flex";
        } else {
            loginScreen.style.display = "none";
        }
        desktop.style.display = "none";
        desktopIcons = [];
        notificationPopup.innerHTML = '';
        notificationIcon.style.color = 'white';
        closeAllMenus();
        windowManager.closeAllWindows();
        hasUnsavedChanges = false;
    }
});

async function handleLogout() {
    try {
        if (hasUnsavedChanges) {
            await desktopManager.forceSave();
        }
        await signOut(auth);
        console.log("✅ Logout realizado");
    } catch (error) {
        console.error("❌ Erro no logout:", error);
    }
}

async function handleSwitchAccount() {
    try {
        if (hasUnsavedChanges) {
            await desktopManager.forceSave();
        }
        await signOut(auth);
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("❌ Erro ao trocar conta:", error);
    }
}

// ============================================
// INTERFACE DO USUÁRIO
// ============================================
function populateUserMenu(userName, userEmail, photoURL) {
    userMenu.innerHTML = '';
    
    const userHeader = document.createElement('div');
    userHeader.className = 'user-info-header';
    userHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            ${photoURL 
                ? `<img src="${photoURL}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);">` 
                : '<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0078d7, #00b4d8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">' + (userName?.charAt(0) || 'U') + '</div>'}
            <div>
                <div class="user-name">${userName || 'Usuário'}</div>
                <div class="user-email">${userEmail || ''}</div>
            </div>
        </div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
            ${hasUnsavedChanges ? '⚠️ Alterações não salvas' : '✓ Tudo salvo'}
        </div>
    `;
    userMenu.appendChild(userHeader);
    
    const separator = document.createElement('hr');
    separator.style.cssText = 'border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;';
    userMenu.appendChild(separator);
    
    const switchAccountItem = document.createElement('div');
    switchAccountItem.className = 'menu-item';
    switchAccountItem.innerHTML = `<img src="https://wazzimagiygg.com/iconmagic.png" alt="icon"> 🔄 Trocar de Conta`;
    switchAccountItem.onclick = handleSwitchAccount;
    userMenu.appendChild(switchAccountItem);
    
    const logoutItem = document.createElement('div');
    logoutItem.className = 'menu-item';
    logoutItem.innerHTML = `<img src="https://wazzimagiygg.com/iconmagic.png" alt="icon"> 🚪 Sair`;
    logoutItem.onclick = handleLogout;
    userMenu.appendChild(logoutItem);
}

// ============================================
// FUNÇÕES DE MENU E LINKS DINÂMICOS
// ============================================
async function loadDynamicLinks(userId) {
    try {
        const SITE_ID = "wazzimagiygg";
        const KEY_DOCUMENT_ID = `${SITE_ID}_menu_list`;
        const docRef = doc(db, "keymenulista", KEY_DOCUMENT_ID);
        const docSnap = await getDoc(docRef);

        let allLinksFromDB = [];

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data[KEY_ARRAY_FIELD] && Array.isArray(data[KEY_ARRAY_FIELD])) {
                allLinksFromDB = data[KEY_ARRAY_FIELD].map((item, index) => ({
                    name: item.titulo,
                    url: item.link_url,
                    iconUrl: item.url_imagem || 'https://wazzimagiygg.com/iconmagic.png',
                    menu_target: item.menu_target || 'outros',
                    normalizedName: urlParamsProcessor.normalizeString(item.titulo),
                    extractedUid: urlParamsProcessor.extractUidFromUrl(item.link_url),
                    fileName: urlParamsProcessor.extractFileNameFromUrl(item.link_url)
                }));
                
                console.log(`📥 ${allLinksFromDB.length} links carregados do Firebase`);
            }
        }

        const linksParaIniciar = allLinksFromDB.filter(item => item.menu_target === 'menu_iniciar');
        const linksParaAdmin = allLinksFromDB.filter(item => item.menu_target === 'wiki_pedia');
        const linksParaFerramentas = allLinksFromDB.filter(item => item.menu_target === 'ferramentas');

        dynamicLinks = {
            all: allLinksFromDB,
            iniciar: linksParaIniciar,
            admin: linksParaAdmin,
            ferramentas: linksParaFerramentas
        };

        populateMenu(startMenu, [...staticStartLinks, ...linksParaIniciar]);
        populateMenu(adminMenu, [...staticAdminLinks, ...linksParaAdmin]);
        populateToolsMenu(linksParaFerramentas);

        loadingManager.markFirebaseLoaded();

    } catch (error) {
        console.error("❌ Erro ao carregar links do Firebase:", error);
        
        populateMenu(startMenu, staticStartLinks);
        populateMenu(adminMenu, staticAdminLinks);
        populateToolsMenu([]);
        
        loadingManager.markFirebaseLoaded();
    }
}

function populateMenu(menuElement, linksArray) {
    menuElement.innerHTML = '';
    
    linksArray.forEach(item => {
        const div = document.createElement("div");
        div.className = "menu-item";
        div.innerHTML = `<img src="${item.iconUrl || 'https://wazzimagiygg.com/iconmagic.png'}" alt="icon"> ${item.name}`;
        
        div.onclick = () => {
            if (item.action === 'logout') {
                handleLogout();
            } else {
                windowManager.createWindow(item.name, item.url, item.iconUrl);
            }
            closeAllMenus();
        };
        
        menuElement.appendChild(div);
    });
}

function populateToolsMenu(linksArray) {
    toolsMenu.innerHTML = '';
    
    const filteredLinks = linksArray.filter(link => 
        !link.url.includes('base44.app') && !link.url.includes('base44.com')
    );
    
    filteredLinks.forEach(link => {
        const a = document.createElement("a");
        a.textContent = link.name;
        a.href = "#";
        a.style.cssText = `
            display: block;
            color: white;
            padding: 10px 12px;
            border-radius: 8px;
            text-decoration: none;
            margin-bottom: 4px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        `;
        
        a.onmouseover = () => {
            a.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1))';
            a.style.borderColor = 'rgba(255,255,255,0.1)';
        };
        
        a.onmouseout = () => {
            a.style.background = 'transparent';
            a.style.borderColor = 'transparent';
        };
        
        a.onclick = (e) => {
            e.preventDefault();
            windowManager.createWindow(link.name, link.url, link.iconUrl);
            closeAllMenus();
        };
        
        toolsMenu.appendChild(a);
    });
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================
async function checkNotifications() {
    try {
        const response = await fetch(JSON_URL);
        if (!response.ok) throw new Error('Erro ao carregar notificações');
        
        const data = await response.json();
        const userLocation = await getUserLocation();
        
        updateNotifications(data, userLocation);
        
    } catch (error) {
        console.warn("⚠️ Aviso: Não foi possível carregar notificações", error);
        addNotification('ℹ️ Sistema de notificações carregado', 'info');
    }
}

async function getUserLocation() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return {
            city: data.city || 'Desconhecida',
            region: data.region || 'Desconhecido',
            country: data.country || 'Desconhecido',
            ip: data.ip || 'N/A'
        };
    } catch (error) {
        return {
            city: 'Desconhecida',
            region: 'Desconhecido',
            country: 'Desconhecido',
            ip: 'N/A'
        };
    }
}

function updateNotifications(sancaoData, userLocation) {
    notificationPopup.innerHTML = '';
    
    addNotification(`📍 <strong>Localização Detectada:</strong><br>${userLocation.city}, ${userLocation.region}, ${userLocation.country}`, 'info');
    addNotification(`🌐 <strong>IP Público:</strong> ${userLocation.ip}`, 'info');
    
    if (sancaoData?.cidades_sancionadas) {
        const cidadeUsuario = userLocation.city.toLowerCase();
        const paisUsuario = userLocation.country.toLowerCase();
        
        const sancao = sancaoData.cidades_sancionadas.find(item => 
            item.cidade.toLowerCase() === cidadeUsuario || 
            item.cidade.toLowerCase() === paisUsuario
        );
        
        if (sancao) {
            addNotification(`
                🚨 <strong>ALERTA DE SANÇÃO!</strong><br>
                Região com possível atividade suspeita.<br>
                <small>Moderador: ${sancao.moderador}</small>
            `, 'error');
            notificationIcon.style.color = '#ff6b6b';
        } else {
            addNotification('✅ <strong>Status:</strong> Nenhuma sanção detectada na sua região', 'success');
        }
    }
    
    addNotification(`👤 <strong>Usuário:</strong> ${currentUser?.displayName || 'Convidado'}`, 'info');
}

function addNotification(message, type = 'info') {
    const div = document.createElement("div");
    div.className = `notification-item ${type === 'error' ? 'sancao-alerta' : ''}`;
    div.innerHTML = message;
    notificationPopup.prepend(div);
}

// ============================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ============================================
[startMenu, adminMenu, toolsMenu, notificationPopup, userMenu].forEach(setupMenuClickOutside);

startBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = startMenu.style.display === "block";
    closeAllMenus();
    if (!isVisible) {
        startMenu.style.display = "block";
        startMenu.style.left = "10px";
        startMenu.style.bottom = "45px";
        menuOverlay.style.display = "block";
    }
};

adminBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = adminMenu.style.display === "block";
    closeAllMenus();
    if (!isVisible) {
        adminMenu.style.display = "block";
        adminMenu.style.left = "120px";
        adminMenu.style.bottom = "45px";
        menuOverlay.style.display = "block";
    }
};

toolsBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = toolsMenu.style.display === "block";
    closeAllMenus();
    if (!isVisible) {
        toolsMenu.style.display = "block";
        toolsMenu.style.left = "230px";
        toolsMenu.style.bottom = "45px";
        menuOverlay.style.display = "block";
    }
};

notificationIcon.onclick = (e) => {
    e.stopPropagation();
    const isVisible = notificationPopup.style.display === "block";
    closeAllMenus();
    if (!isVisible) {
        notificationPopup.style.display = "block";
        notificationPopup.style.right = "60px";
        notificationPopup.style.bottom = "50px";
        menuOverlay.style.display = "block";
    }
};

clockElement.onclick = (e) => {
    e.stopPropagation();
    const isVisible = userMenu.style.display === "block";
    closeAllMenus();
    if (!isVisible) {
        userMenu.style.display = "block";
        userMenu.style.right = "10px";
        userMenu.style.bottom = "45px";
        menuOverlay.style.display = "block";
    }
};

showAllBtn.onclick = () => {
    windowManager.showAllWindows();
};

taskbarIcons.parentElement.ondblclick = (e) => {
    if (e.target === taskbarIcons.parentElement || e.target === taskbarIcons) {
        const allMinimized = windowManager.windows.every(w => w.minimized);
        if (allMinimized) {
            windowManager.showAllWindows();
        } else {
            windowManager.minimizeAllWindows();
        }
    }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    
    const dateString = now.toLocaleDateString('pt-BR', { 
        weekday: 'short',
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
    });
    
    clockElement.innerHTML = `
        <span>${timeString}</span><br>
        <span style="font-size: 0.8em; opacity: 0.9;">${dateString}</span>
    `;
    
    setTimeout(updateClock, 1000);
}

// ============================================
// PROTEÇÃO E BLOQUEIO DE TECLAS
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
    }
    
    if (e.key === 'Escape') {
        closeAllMenus();
    }
    
    if (e.ctrlKey && e.key === 'm') {
        if (windowManager.activeWindow) {
            windowManager.minimizeWindow(windowManager.activeWindow);
        }
    }
    
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        desktopManager.forceSave();
    }
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

desktopArea.addEventListener('contextmenu', function(e) {
    return true;
});

// ============================================
// SISTEMA DE SALVAMENTO AUTOMÁTICO
// ============================================
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges && currentUser) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas no desktop. Deseja sair mesmo assim?';
        return e.returnValue;
    }
});

window.addEventListener('blur', () => {
    if (hasUnsavedChanges) {
        desktopManager.forceSave();
    }
});

setInterval(() => {
    if (hasUnsavedChanges && currentUser) {
        console.log("⏰ Salvamento periódico...");
        desktopManager.forceSave();
    }
}, 30000);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        desktopManager.forceSave();
    }
});

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================
console.log("🚀 Sistema Wiki Not Pedia WZZM com Desktop Dinâmico inicializado");

const animationsStyle = document.createElement('style');
animationsStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .desktop-icon {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(animationsStyle);

// Inicializar verificação de cookies
initializeCookieCheck();

// Função para detectar se é um dispositivo móvel (incluindo tablets)
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (window.innerWidth <= 800) ||
        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Se for um dispositivo móvel e não estiver já na pasta mobile, redireciona
if (isMobileDevice() && !window.location.pathname.includes('/mobile/')) {
    window.location.href = "/mobile/";
}
