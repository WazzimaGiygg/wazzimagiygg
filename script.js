// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;
let isGuestUser = false;
let isBanned = false;
let isAdmin = false;
let currentTab = 'wikiworldweb';
let allItems = {};
let notifications = [];
let unreadCount = 0;
let notificationListener = null;

// ============================================
// COOKIE CONSENT MANAGER
// ============================================
const CookieManager = {
    STORAGE_KEY: 'wzzm_cookie_consent',
    
    defaults: {
        essential: true,
        analytics: true,
        advertising: true
    },
    
    init() {
        const consent = this.getConsent();
        if (!consent) {
            this.showBanner();
        } else {
            this.applyConsent(consent);
            this.hideBanner();
        }
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        document.getElementById('cookieAcceptAll')?.addEventListener('click', () => {
            this.acceptAll();
        });
        
        document.getElementById('cookieRejectAll')?.addEventListener('click', () => {
            this.rejectAll();
        });
        
        document.getElementById('cookieCustomize')?.addEventListener('click', () => {
            this.customize();
        });
    },
    
    getConsent() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
    
    saveConsent(preferences) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            ...preferences,
            timestamp: new Date().toISOString()
        }));
    },
    
    showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            // Pequeno delay para a animação funcionar
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    },
    
    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('show');
        }
    },
    
    applyConsent(consent) {
        // 1. Google Analytics
        if (consent.analytics !== false) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // 2. Google AdSense (personalização)
        if (consent.advertising !== false) {
            this.enablePersonalizedAds();
        } else {
            this.disablePersonalizedAds();
        }
        
        console.log('🍪 Preferências de cookies aplicadas:', consent);
    },
    
    enableAnalytics() {
        // Habilitar Google Analytics
        if (window.ga) {
            window.ga('set', 'allowAdFeatures', true);
            console.log('📊 Analytics habilitado');
        }
    },
    
    disableAnalytics() {
        // Desabilitar Google Analytics
        if (window.ga) {
            window.ga('set', 'allowAdFeatures', false);
        }
        // Sinalizar para o GA não rastrear
        window['ga-disable-UA-XXXXXXXX-X'] = true;
        console.log('📊 Analytics desabilitado');
    },
    
    enablePersonalizedAds() {
        // Habilitar anúncios personalizados
        document.cookie = "ad_personalization=enabled; path=/; max-age=31536000; samesite=lax";
        console.log('📢 Anúncios personalizados habilitados');
    },
    
    disablePersonalizedAds() {
        // Desabilitar anúncios personalizados
        document.cookie = "ad_personalization=disabled; path=/; max-age=31536000; samesite=lax";
        console.log('📢 Anúncios personalizados desabilitados');
    },
    
    acceptAll() {
        const consent = {
            essential: true,
            analytics: true,
            advertising: true
        };
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        this.showToast('✅ Todos os cookies foram aceitos!');
    },
    
    rejectAll() {
        const consent = {
            essential: true,
            analytics: false,
            advertising: false
        };
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        this.showToast('ℹ️ Cookies não essenciais foram recusados. Algumas funcionalidades podem ser limitadas.', 'info');
    },
    
    customize() {
        const analytics = document.getElementById('cookieAnalytics')?.checked !== false;
        const advertising = document.getElementById('cookieAdvertising')?.checked !== false;
        
        const consent = {
            essential: true,
            analytics: analytics,
            advertising: advertising
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        this.showToast('✅ Suas preferências foram salvas!', 'success');
    },
    
    showToast(message, type = 'info') {
        // Usar função showToast existente ou criar uma
        if (typeof showToast === 'function') {
            showToast(message, type === 'error');
        } else {
            // Fallback
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.style.background = type === 'error' ? '#c0392b' : 
                                        type === 'success' ? '#27ae60' : '#2980b9';
                toast.style.display = 'block';
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 3000);
            } else {
                alert(message);
            }
        }
    },
    
    // Verificar se um tipo de cookie específico é permitido
    isAllowed(cookieType) {
        const consent = this.getConsent();
        if (!consent) return true; // Se não há preferência, permitir
        return consent[cookieType] !== false;
    },
    
    // Verificar se analytics está permitido
    isAnalyticsAllowed() {
        return this.isAllowed('analytics');
    },
    
    // Verificar se publicidade personalizada está permitida
    isAdvertisingAllowed() {
        return this.isAllowed('advertising');
    }
};

// ============================================
// UTILIDADES
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function stripHtml(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function formatDate(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    if (timestamp.toDate) timestamp = timestamp.toDate();
    return timestamp.toLocaleDateString('pt-BR');
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    if (timestamp.toDate) timestamp = timestamp.toDate();
    return timestamp.toLocaleString('pt-BR');
}

function getTimeAgo(date) {
    if (!date) return '';
    if (date.toDate) date = date.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function renderHtmlContent(htmlContent) {
    if (!htmlContent) return '<p>Sem conteúdo.</p>';
    return DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','hr','b','i','strong','em',
                       'ul','ol','li','a','img','table','thead','tbody','tr','th','td',
                       'pre','code','blockquote','div','span','figure','figcaption'],
        ALLOWED_ATTR: ['href','src','alt','title','class','id','width','height','target','rel']
    });
}

function getIconForTab(tab) {
    const icons = {
        'wikiworldweb': '🌐', 'materiadeensaio': '📚',
        'academico': '🎓', 'materia': '📖', 'uwgbooks': '📘'
    };
    return icons[tab] || '📰';
}

function getBadgeForTab(tab) {
    const badges = {
        'wikiworldweb': 'WikiWorld', 'materiadeensaio': 'Notícia',
        'academico': 'Acadêmico', 'materia': 'Matéria', 'uwgbooks': 'UWG Book'
    };
    return badges[tab] || 'Conteúdo';
}

// ============================================
// FUNÇÃO PARA REGISTRAR USUÁRIO
// ============================================
async function registerUser(user, isGuest = false) {
    try {
        const uid = user.uid;
        const userData = {
            uid: uid,
            email: user.email || (isGuest ? `${uid}@guest.local` : ''),
            name: user.displayName || (isGuest ? 'Convidado' : 'Usuário'),
            profilePictureUrl: user.photoURL || (isGuest ? '' : ''),
            isAdmin: false,
            isBan: false,
            isBanned: false,
            isTeacher: false,
            isTeatcher: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            // Cookie consent preferences
            cookiePreferences: CookieManager.getConsent() || null
        };

        await db.collection('users').doc(uid).set(userData, { merge: true });
        await db.collection('usuários').doc(uid).set(userData, { merge: true });

        console.log(`Usuário ${uid} registrado com sucesso!`);
        return true;
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return false;
    }
}

// ============================================
// FUNÇÃO PARA VERIFICAR SE USUÁRIO ESTÁ BANIDO
// ============================================
async function checkIfUserIsBanned(user) {
    if (!user) return false;
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            return userDoc.data().isBanned === true || userDoc.data().isBan === true;
        }
    } catch (error) {
        console.log("Erro ao verificar banimento:", error);
    }
    return false;
}

function showBannedScreen(reason = 'Violação das políticas de uso') {
    const overlay = document.getElementById('bannedOverlay');
    const details = document.getElementById('banDetails');
    details.textContent = `Motivo: ${reason}`;
    overlay.classList.add('show');
    document.querySelector('.header').style.opacity = '0.3';
    document.querySelector('.header').style.pointerEvents = 'none';
    document.querySelector('.newspaper-container').style.opacity = '0.3';
    document.querySelector('.newspaper-container').style.pointerEvents = 'none';
    document.querySelector('.footer').style.opacity = '0.3';
    document.querySelector('.footer').style.pointerEvents = 'none';
}

async function logoutBanned() {
    try {
        await auth.signOut();
        location.reload();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        location.reload();
    }
}

// ============================================
// NOTIFICAÇÕES
// ============================================
async function loadNotifications() {
    if (!currentUser) return;
    
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ 
                id: doc.id, 
                ...doc.data(),
                timestamp: doc.data().timestamp || new Date()
            });
        });
        
        notifications.sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
        });
        
        unreadCount = notifications.filter(n => !n.lida).length;
        updateNotificationBadge();
        renderNotifications();
        
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <span class="material-icons">notifications_off</span>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    const recentNotifs = notifications.slice(0, 10);
    
    list.innerHTML = recentNotifs.map(notif => `
        <div class="notification-item ${notif.lida ? '' : 'unread'}" onclick="markAsRead('${notif.id}')">
            <div class="notif-title">${escapeHtml(notif.titulo || 'Notificação')}</div>
            <div class="notif-message">${escapeHtml(notif.mensagem || '')}</div>
            <div class="notif-time">${getTimeAgo(notif.timestamp)}</div>
        </div>
    `).join('');
}

async function markAsRead(notificationId) {
    if (!notificationId) return;
    
    try {
        await db.collection('notifications').doc(notificationId).update({
            lida: true
        });
        
        const notif = notifications.find(n => n.id === notificationId);
        if (notif && !notif.lida) {
            notif.lida = true;
            unreadCount--;
            updateNotificationBadge();
            renderNotifications();
        }
    } catch (error) {
        console.error('❌ Erro ao marcar como lida:', error);
    }
}

async function markAllAsRead(event) {
    if (event) event.stopPropagation();
    
    if (unreadCount === 0) return;
    
    try {
        const batch = db.batch();
        const unreadNotifs = notifications.filter(n => !n.lida);
        
        unreadNotifs.forEach(notif => {
            const ref = db.collection('notifications').doc(notif.id);
            batch.update(ref, { lida: true });
        });
        
        await batch.commit();
        
        notifications.forEach(n => n.lida = true);
        unreadCount = 0;
        updateNotificationBadge();
        renderNotifications();
    } catch (error) {
        console.error('❌ Erro ao marcar todas como lidas:', error);
    }
}

function toggleNotifications(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            loadNotifications();
        }
    }
}

function listenNotifications() {
    if (notificationListener) {
        notificationListener();
        notificationListener = null;
    }
    
    if (!currentUser) return;
    
    notificationListener = db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    timestamp: doc.data().timestamp || new Date()
                });
            });
            
            notifications.sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return dateB - dateA;
            });
            
            unreadCount = notifications.filter(n => !n.lida).length;
            updateNotificationBadge();
            renderNotifications();
        }, (error) => {
            console.error('❌ Erro no listener de notificações:', error);
        });
}

// ============================================
// FUNÇÃO PARA CARREGAR CONTEÚDO SEM LOGIN
// ============================================
async function loadContentPublic() {
    showLoading();
    
    try {
        const [wikiworld, ensaio, academico, materia, uwgbooks] = await Promise.all([
            loadWikiworldContentPublic(),
            loadEnsaioContentPublic(),
            loadAcademicoContentPublic(),
            loadMateriaContentPublic(),
            loadUwgbooksContentPublic()
        ]);
        
        allItems = {
            wikiworldweb: wikiworld,
            materiadeensaio: ensaio,
            academico: academico,
            materia: materia,
            uwgbooks: uwgbooks
        };
        
        renderCurrentTab();
    } catch (error) {
        console.error('Erro ao carregar conteúdo público:', error);
        document.getElementById('main-wrapper').innerHTML = `
            <div style="grid-column:1/-1;">
                <div class="empty-state">📭 Erro ao carregar conteúdo. Tente novamente mais tarde.</div>
            </div>
        `;
    }
}

async function loadWikiworldContentPublic() {
    try {
        const snapshot = await db.collection('wikiworldweb').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Geral', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'wikiworldweb'
            });
        });
        document.getElementById('total-wikiworld').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro wikiworldweb:', error);
        return [];
    }
}

async function loadEnsaioContentPublic() {
    try {
        const snapshot = await db.collection('materiadeensaio').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Geral', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'materiadeensaio'
            });
        });
        document.getElementById('total-ensaio').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro materiadeensaio:', error);
        return [];
    }
}

async function loadAcademicoContentPublic() {
    try {
        const snapshot = await db.collection('academico').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Acadêmico', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'academico'
            });
        });
        document.getElementById('total-academico').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro academico:', error);
        return [];
    }
}

async function loadMateriaContentPublic() {
    try {
        const snapshot = await db.collection('materia').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Matéria', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'materia'
            });
        });
        document.getElementById('total-materia').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro materia:', error);
        return [];
    }
}

async function loadUwgbooksContentPublic() {
    try {
        const snapshot = await db.collection('uwgbooks').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'UWG Books', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'uwgbooks'
            });
        });
        document.getElementById('total-uwgbooks').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro uwgbooks:', error);
        return [];
    }
}

// ============================================
// AUTENTICAÇÃO
// ============================================
function generateGuestUID() {
    return 'convid_' + Math.random().toString(36).substring(2, 15);
}

function createGuestUser() {
    const guestUID = generateGuestUID();
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    const guestUser = { 
        uid: guestUID, 
        displayName: 'Convidado', 
        email: `${guestUID}@guest.local`, 
        isGuest: true 
    };
    localStorage.setItem('wzzm_guest_user', JSON.stringify(guestUser));
    localStorage.setItem('wzzm_guest_expiry', expiry.toString());
    return guestUser;
}

function getStoredGuestUser() {
    const expiry = localStorage.getItem('wzzm_guest_expiry');
    if (expiry && Date.now() < parseInt(expiry)) {
        const stored = localStorage.getItem('wzzm_guest_user');
        if (stored) return JSON.parse(stored);
    }
    return null;
}

function clearGuestUser() {
    localStorage.removeItem('wzzm_guest_user');
    localStorage.removeItem('wzzm_guest_expiry');
}

function updateUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userBadge = document.getElementById('userBadge');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    
    if (currentUser && !isBanned) {
        let name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Usuário');
        if (isGuestUser) name = '👤 Convidado';
        
        if (currentUser.photoURL) {
            userAvatar.innerHTML = `<img src="${currentUser.photoURL}" alt="Avatar">`;
        } else {
            userAvatar.textContent = getInitials(name);
        }
        
        userName.textContent = name.length > 20 ? name.substring(0,17)+'...' : name;
        userEmail.textContent = currentUser.email || '';
        
        let badges = '';
        if (isBanned) badges += '<span class="badge-banned">🚫 Banido</span> ';
        if (isAdmin) badges += '<span class="badge-admin">Admin</span> ';
        userBadge.innerHTML = badges;
        
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
    } else {
        userAvatar.innerHTML = '👤';
        userName.textContent = 'Visitante';
        userEmail.textContent = '';
        userBadge.innerHTML = '';
        btnLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
    }
}

function showLoginModal() { document.getElementById('login-modal').classList.add('show'); }
function hideLoginModal() { document.getElementById('login-modal').classList.remove('show'); }

async function loginWithGoogle() {
    try { 
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        await registerUser(user, false);
        
        hideLoginModal(); 
        location.reload();
    } catch (error) { 
        alert('Erro: ' + error.message); 
    }
}

async function guestLogin() {
    const guestUser = createGuestUser();
    currentUser = guestUser;
    isGuestUser = true;
    
    await registerUser(guestUser, true);
    
    updateUI();
    hideLoginModal();
    location.reload();
}

// ============================================
// FUNÇÃO DE LOGOUT CORRIGIDA
// ============================================
async function logout() { 
    try {
        clearGuestUser();
        
        if (auth.currentUser) {
            await auth.signOut();
        }
        
        currentUser = null;
        isGuestUser = false;
        isAdmin = false;
        
        if (notificationListener) {
            notificationListener();
            notificationListener = null;
        }
        notifications = [];
        unreadCount = 0;
        updateNotificationBadge();
        
        updateUI();
        await loadContentPublic();
        location.reload();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showToast('Erro ao sair: ' + error.message, true);
    }
}

function showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 2000;
            display: none;
            animation: fadeInOut 3s ease;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.background = isError ? '#c0392b' : '#27ae60';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// ============================================
// CARREGAMENTO DE CONTEÚDO
// ============================================
async function loadAllContent() {
    if (currentUser && !isBanned) {
        showLoading();
        
        const [wikiworld, ensaio, academico, materia, uwgbooks] = await Promise.all([
            loadWikiworldContent(),
            loadEnsaioContent(),
            loadAcademicoContent(),
            loadMateriaContent(),
            loadUwgbooksContent()
        ]);
        
        allItems = {
            wikiworldweb: wikiworld,
            materiadeensaio: ensaio,
            academico: academico,
            materia: materia,
            uwgbooks: uwgbooks
        };
        
        renderCurrentTab();
    } else {
        await loadContentPublic();
    }
}

async function loadWikiworldContent() {
    try {
        const snapshot = await db.collection('wikiworldweb').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Geral', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'wikiworldweb'
            });
        });
        document.getElementById('total-wikiworld').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro wikiworldweb:', error);
        return [];
    }
}

async function loadEnsaioContent() {
    try {
        const snapshot = await db.collection('materiadeensaio').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Geral', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'materiadeensaio'
            });
        });
        document.getElementById('total-ensaio').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro materiadeensaio:', error);
        return [];
    }
}

async function loadAcademicoContent() {
    try {
        const snapshot = await db.collection('academico').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Acadêmico', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'academico'
            });
        });
        document.getElementById('total-academico').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro academico:', error);
        return [];
    }
}

async function loadMateriaContent() {
    try {
        const snapshot = await db.collection('materia').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'Matéria', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'materia'
            });
        });
        document.getElementById('total-materia').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro materia:', error);
        return [];
    }
}

async function loadUwgbooksContent() {
    try {
        const snapshot = await db.collection('uwgbooks').orderBy('ultimaEdicao', 'desc').get();
        const items = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id, titulo: data.titulo || 'Sem título', descricao: data.descricao || '',
                setor: data.setor || 'UWG Books', criadorEmail: data.criadorEmail || 'Sistema',
                dataCriacao: data.dataCriacao, ultimaEdicao: data.ultimaEdicao,
                visualizacoes: data.visualizacoes || 0, colecao: 'uwgbooks'
            });
        });
        document.getElementById('total-uwgbooks').textContent = items.length;
        return items;
    } catch (error) {
        console.error('Erro uwgbooks:', error);
        return [];
    }
}

function showLoading() {
    document.getElementById('main-wrapper').innerHTML = `
        <div style="grid-column:1/-1;">
            <div class="loading-container"><div class="spinner"></div><p>Carregando conteúdo...</p></div>
        </div>
    `;
}

// ============================================
// RENDERIZAÇÃO
// ============================================
function renderCurrentTab() {
    const items = allItems[currentTab] || [];
    if (items.length === 0) {
        document.getElementById('main-wrapper').innerHTML = `
            <div style="grid-column:1/-1;">
                <div class="empty-state">📭 Nenhum conteúdo encontrado em ${getBadgeForTab(currentTab)}.</div>
            </div>
        `;
        return;
    }
    
    const mainArticle = items[0];
    const leftArticles = items.slice(1, 4);
    const rightArticles = items.slice(4, 8);
    
    const renderCard = (item, isMain = false) => {
        const date = formatDate(item.ultimaEdicao);
        const badge = getBadgeForTab(currentTab);
        const icon = getIconForTab(currentTab);
        const cleanExcerpt = stripHtml(item.descricao || '');
        const excerptText = cleanExcerpt.length > (isMain ? 300 : 150) 
            ? cleanExcerpt.substring(0, isMain ? 300 : 150) + '...' 
            : cleanExcerpt;
        
        if (isMain) {
            return `
                <div class="main-article">
                    <div class="article-tag">${icon} ${badge} · DESTAQUE</div>
                    <div class="article-title"><a onclick="selectItem('${item.id}', '${item.colecao}')">${escapeHtml(item.titulo)}</a></div>
                    <div class="article-meta">
                        <span><i class="material-icons" style="font-size:12px;">person</i> ${escapeHtml(item.criadorEmail?.split('@')[0] || 'Redação')}</span>
                        <span><i class="material-icons" style="font-size:12px;">calendar_today</i> ${date}</span>
                        <span><i class="material-icons" style="font-size:12px;">visibility</i> ${item.visualizacoes || 0}</span>
                    </div>
                    <div class="article-excerpt">${escapeHtml(excerptText)}</div>
                    <a class="read-more" onclick="selectItem('${item.id}', '${item.colecao}')">Continue lendo →</a>
                </div>
            `;
        }
        
        return `
            <div class="article-card">
                <div class="article-tag">${icon} ${badge}</div>
                <div class="article-title"><a onclick="selectItem('${item.id}', '${item.colecao}')">${escapeHtml(item.titulo)}</a></div>
                <div class="article-meta">
                    <span><i class="material-icons" style="font-size:12px;">person</i> ${escapeHtml(item.criadorEmail?.split('@')[0] || 'Redação')}</span>
                    <span><i class="material-icons" style="font-size:12px;">calendar_today</i> ${date}</span>
                </div>
            </div>
        `;
    };
    
    document.getElementById('main-wrapper').innerHTML = `
        <div class="sidebar-left">${leftArticles.map(a => renderCard(a, false)).join('') || '<div class="article-card"><p>📭 Mais conteúdos em breve...</p></div>'}</div>
        <div>${renderCard(mainArticle, true)}</div>
        <div class="sidebar-right">${rightArticles.map(a => renderCard(a, false)).join('') || '<div class="article-card"><p>📭 Aguarde novas publicações...</p></div>'}</div>
    `;
}

// ============================================
// SELEÇÃO DE ITEM (PÚBLICO)
// ============================================
window.selectItem = async function(itemId, collection) {
    document.getElementById('main-wrapper').innerHTML = '<div class="loading-container" style="grid-column:1/-1;"><div class="spinner"></div><p>Carregando...</p></div>';
    
    try {
        const doc = await db.collection(collection).doc(itemId).get();
        if (!doc.exists) throw new Error('Item não encontrado');
        
        const data = doc.data();
        
        if (!isGuestUser && currentUser) {
            try {
                const novasViews = (data.visualizacoes || 0) + 1;
                await db.collection(collection).doc(itemId).update({ visualizacoes: novasViews });
            } catch (e) {
                console.log('Não foi possível incrementar visualizações:', e);
            }
        }
        
        const badge = getBadgeForTab(currentTab);
        const date = formatDateTime(data.ultimaEdicao || data.dataCriacao);
        const conteudoHtml = renderHtmlContent(data.descricao);
        
        document.getElementById('main-wrapper').innerHTML = `
            <div style="grid-column:1/-1;">
                <div class="article-detail">
                    <h1>${escapeHtml(data.titulo)}</h1>
                    <div class="article-meta">
                        <p><strong>📋 Tipo:</strong> ${badge}</p>
                        <p><strong>🏷️ Categoria:</strong> ${escapeHtml(data.setor || 'Geral')}</p>
                        <p><strong>👤 Autor:</strong> ${escapeHtml(data.criadorEmail || 'Sistema')}</p>
                        <p><strong>📅 Criado:</strong> ${formatDateTime(data.dataCriacao)}</p>
                        <p><strong>✏️ Edição:</strong> ${date}</p>
                        <p><strong>👁️ Views:</strong> ${(data.visualizacoes || 0).toLocaleString()}</p>
                    </div>
                    <div class="article-content">${conteudoHtml}</div>
                    <button onclick="filterByTab('${currentTab}')" style="margin-top:30px; padding:10px 20px; background:#1a3c5e; color:white; border:none; border-radius:30px; cursor:pointer;">← Voltar</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('main-wrapper').innerHTML = `<div style="grid-column:1/-1;"><div class="empty-state">❌ Erro: ${error.message}</div></div>`;
    }
};

// ============================================
// FILTROS E BUSCA (PÚBLICOS)
// ============================================
window.filterByTab = function(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.classList.toggle('active', a.dataset.tab === tab);
    });
    
    if (allItems[tab] && allItems[tab].length > 0) {
        renderCurrentTab();
    } else {
        loadAllContent();
    }
};

function searchContent() {
    const term = document.getElementById('search-input').value.toLowerCase().trim();
    if (!term) {
        renderCurrentTab();
        return;
    }
    
    const items = allItems[currentTab] || [];
    const filtered = items.filter(item => 
        item.titulo.toLowerCase().includes(term) ||
        stripHtml(item.descricao || '').toLowerCase().includes(term)
    );
    
    if (filtered.length === 0) {
        document.getElementById('main-wrapper').innerHTML = `<div style="grid-column:1/-1;"><div class="empty-state">🔍 Nenhum resultado para "${escapeHtml(term)}"</div></div>`;
        return;
    }
    
    const mainArticle = filtered[0];
    const leftArticles = filtered.slice(1, 4);
    const rightArticles = filtered.slice(4, 8);
    
    const renderCard = (item, isMain = false) => {
        const date = formatDate(item.ultimaEdicao);
        const badge = getBadgeForTab(currentTab);
        const icon = getIconForTab(currentTab);
        const cleanExcerpt = stripHtml(item.descricao || '');
        const excerptText = cleanExcerpt.length > (isMain ? 300 : 150) ? cleanExcerpt.substring(0, isMain ? 300 : 150) + '...' : cleanExcerpt;
        
        if (isMain) {
            return `
                <div class="main-article">
                    <div class="article-tag">${icon} ${badge}</div>
                    <div class="article-title"><a onclick="selectItem('${item.id}','${item.colecao}')">${escapeHtml(item.titulo)}</a></div>
                    <div class="article-meta">${escapeHtml(item.criadorEmail?.split('@')[0] || 'Redação')} | ${date}</div>
                    <div class="article-excerpt">${escapeHtml(excerptText)}</div>
                    <a class="read-more" onclick="selectItem('${item.id}','${item.colecao}')">Leia mais →</a>
                </div>
            `;
        }
        
        return `
            <div class="article-card">
                <div class="article-tag">${icon} ${badge}</div>
                <div class="article-title"><a onclick="selectItem('${item.id}','${item.colecao}')">${escapeHtml(item.titulo)}</a></div>
                <div class="article-meta">${escapeHtml(item.criadorEmail?.split('@')[0] || 'Redação')} | ${date}</div>
            </div>
        `;
    };
    
    document.getElementById('main-wrapper').innerHTML = `
        <div class="sidebar-left">${leftArticles.map(a => renderCard(a, false)).join('')}</div>
        <div>${renderCard(mainArticle, true)}</div>
        <div class="sidebar-right">${rightArticles.map(a => renderCard(a, false)).join('')}</div>
    `;
}

// ============================================
// VERIFICADOR DE REDIRECIONAMENTO POR UID
// ============================================
async function checkRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('id') || urlParams.get('uid');
    const redirectParam = urlParams.get('redirect');
    
    if (uid) {
        try {
            console.log('🔍 Verificando redirecionamento para UID:', uid);
            
            const docRef = db.collection('redirecionamento').doc(uid);
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                const data = docSnap.data();
                console.log('✅ Redirecionamento encontrado:', data);
                
                if (redirectParam === 'html' && data.htmlCode) {
                    document.documentElement.innerHTML = data.htmlCode;
                    const scripts = document.querySelectorAll('script');
                    scripts.forEach(script => {
                        const newScript = document.createElement('script');
                        newScript.textContent = script.textContent;
                        document.body.appendChild(newScript);
                    });
                    return true;
                }
                
                if (data.targetUrl) {
                    const delay = data.delayTime || 5;
                    const message = data.messageText || 'Você será redirecionado em {TEMPO} segundos.';
                    const finalMessage = message.replace(/\[TEMPO\]/g, delay);
                    
                    showRedirectPage(delay, data.targetUrl, finalMessage);
                    return true;
                }
            } else {
                console.log('❌ Redirecionamento não encontrado para UID:', uid);
                showRedirectNotFound();
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar redirecionamento:', error);
            showRedirectError();
            return false;
        }
    }
    return false;
}

// ============================================
// FUNÇÕES DE REDIRECIONAMENTO
// ============================================
function showRedirectPage(delay, targetUrl, message) {
    const header = document.querySelector('.header');
    const container = document.querySelector('.newspaper-container');
    const footer = document.querySelector('.footer');
    const cookieBanner = document.getElementById('cookieConsent');
    
    if (header) header.style.display = 'none';
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (cookieBanner) cookieBanner.style.display = 'none';
    
    const bannedOverlay = document.getElementById('bannedOverlay');
    if (bannedOverlay) bannedOverlay.style.display = 'none';
    
    const redirectDiv = document.createElement('div');
    redirectDiv.id = 'redirectPage';
    redirectDiv.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: 'Lato', Arial, sans-serif;
            padding: 20px;
        ">
            <div style="
                padding: 40px;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                text-align: center;
                max-width: 500px;
                width: 90%;
                animation: fadeIn 0.5s ease;
            ">
                <div style="font-size: 3em; margin-bottom: 20px;">🔄</div>
                <h1 style="color: #1a3c5e; margin-bottom: 15px; font-family: 'Playfair Display', serif;">
                    Aguarde um momento...
                </h1>
                <p style="font-size: 1.1em; color: #555; margin-bottom: 25px; line-height: 1.6;">
                    ${escapeHtml(message)}
                </p>
                <div style="margin: 25px 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 3em; font-weight: bold; color: #c0392b;" id="countdownDisplay">${delay}</span>
                    <span style="font-size: 1.2em; color: #666;">segundos</span>
                </div>
                <div style="
                    width: 100%;
                    height: 4px;
                    background: #e0e0e0;
                    border-radius: 2px;
                    margin: 20px 0;
                    overflow: hidden;
                ">
                    <div style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, #c0392b, #e74c3c);
                        border-radius: 2px;
                        animation: progressBar ${delay}s linear forwards;
                    "></div>
                </div>
                <a href="${targetUrl}" style="
                    display: inline-block;
                    padding: 14px 28px;
                    background: #1a3c5e;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: all 0.3s;
                    font-size: 14px;
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 12px rgba(26, 60, 94, 0.3);
                " onmouseover="this.style.background='#c0392b'; this.style.transform='translateY(-2px)'" 
                   onmouseout="this.style.background='#1a3c5e'; this.style.transform='translateY(0)'">
                    🔗 Ir agora para o destino
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Redirecionamento automático em ${delay} segundos
                </p>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes progressBar {
                from { width: 100%; }
                to { width: 0%; }
            }
        </style>
    `;
    
    document.body.appendChild(redirectDiv);
    
    const script = document.createElement('script');
    script.textContent = `
        let countdown = ${delay};
        const display = document.getElementById('countdownDisplay');
        const interval = setInterval(() => {
            countdown--;
            if (display) display.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                window.location.href = '${targetUrl}';
            }
        }, 1000);
        
        setTimeout(() => {
            window.location.href = '${targetUrl}';
        }, ${delay * 1000});
    `;
    document.body.appendChild(script);
}

function showRedirectNotFound() {
    const header = document.querySelector('.header');
    const container = document.querySelector('.newspaper-container');
    const footer = document.querySelector('.footer');
    const cookieBanner = document.getElementById('cookieConsent');
    
    if (header) header.style.display = 'none';
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (cookieBanner) cookieBanner.style.display = 'none';
    
    const redirectDiv = document.createElement('div');
    redirectDiv.id = 'redirectPage';
    redirectDiv.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: 'Lato', Arial, sans-serif;
            padding: 20px;
        ">
            <div style="
                padding: 40px;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                text-align: center;
                max-width: 500px;
                width: 90%;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">🔍</div>
                <h1 style="color: #dc3545; margin-bottom: 15px; font-family: 'Playfair Display', serif;">
                    Redirecionamento não encontrado
                </h1>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                    O redirecionamento que você está procurando não existe ou foi removido.
                </p>
                <a href="/" style="
                    display: inline-block;
                    padding: 14px 28px;
                    background: #6c757d;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: all 0.3s;
                " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
                    🏠 Voltar para o início
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(redirectDiv);
}

function showRedirectError() {
    const header = document.querySelector('.header');
    const container = document.querySelector('.newspaper-container');
    const footer = document.querySelector('.footer');
    const cookieBanner = document.getElementById('cookieConsent');
    
    if (header) header.style.display = 'none';
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (cookieBanner) cookieBanner.style.display = 'none';
    
    const redirectDiv = document.createElement('div');
    redirectDiv.id = 'redirectPage';
    redirectDiv.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: 'Lato', Arial, sans-serif;
            padding: 20px;
        ">
            <div style="
                padding: 40px;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                text-align: center;
                max-width: 500px;
                width: 90%;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">⚠️</div>
                <h1 style="color: #dc3545; margin-bottom: 15px; font-family: 'Playfair Display', serif;">
                    Erro ao carregar redirecionamento
                </h1>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                    Ocorreu um erro ao tentar carregar o redirecionamento. Por favor, tente novamente.
                </p>
                <a href="/" style="
                    display: inline-block;
                    padding: 14px 28px;
                    background: #6c757d;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: all 0.3s;
                " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
                    🏠 Voltar para o início
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(redirectDiv);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// PRIMEIRO: Inicializar Cookie Manager
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gerenciador de cookies
    CookieManager.init();
});

// SEGUNDO: Verificar redirecionamento
checkRedirect().then(isRedirect => {
    if (!isRedirect) {
        console.log('📍 Modo normal - carregando site');
        initSite();
    } else {
        console.log('🔄 Modo redirecionamento ativado');
    }
});

// Função de inicialização do site
function initSite() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('search-btn')?.addEventListener('click', searchContent);
    document.getElementById('search-input')?.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') searchContent(); 
    });
    
    document.getElementById('google-login-btn')?.addEventListener('click', loginWithGoogle);
    document.getElementById('guest-login-modal-btn')?.addEventListener('click', guestLogin);
    document.getElementById('close-modal-btn')?.addEventListener('click', hideLoginModal);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            isGuestUser = false;
            clearGuestUser();
            
            isBanned = await checkIfUserIsBanned(user);
            
            isAdmin = false;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().isAdmin === true) {
                    isAdmin = true;
                }
            } catch (e) {}
            
            await registerUser(user, false);
            
            if (isBanned) {
                showBannedScreen('Sua conta foi banida por violação das políticas de uso.');
                updateUI();
                return;
            }
            
            updateUI();
            await loadNotifications();
            listenNotifications();
            loadAllContent();
        } else {
            const storedGuest = getStoredGuestUser();
            if (storedGuest) {
                currentUser = storedGuest;
                isGuestUser = true;
                updateUI();
            } else {
                currentUser = null;
                isGuestUser = false;
                updateUI();
            }
            loadAllContent();
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-bell')) {
            const dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });

    console.log('🚀 WazzimaGiygg - Site Principal com Login Unificado');
    console.log('📌 Notificações integradas via coleção "notifications"');
    console.log('👤 Usuário pode ver e gerenciar suas notificações');
    console.log('🔄 Redirecionamento por UID integrado');
    console.log('🍪 Sistema de consentimento de cookies ativo');
}
