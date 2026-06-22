import { 
    auth, db, provider, signInWithPopup, signOut, onAuthStateChanged,
    collection, doc, setDoc, getDoc, getDocs, query, where, 
    onSnapshot, addDoc, updateDoc, orderBy, serverTimestamp 
} from './firebase-config.js';

// ============ ESTADO GLOBAL ============
const state = {
    currentUser: null,
    currentChatId: null,
    currentChatUser: null,
    users: [],
    chats: [],
    unsubscribeMessages: null,
    unsubscribeChats: null
};

// ============ ELEMENTOS DOM ============
const DOM = {
    loginContainer: document.getElementById('login-container'),
    chatContainer: document.getElementById('chat-container'),
    loginBtn: document.getElementById('login-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    userStatus: document.getElementById('user-status'),
    
    chatList: document.getElementById('chat-list'),
    messages: document.getElementById('messages'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    
    chatHeader: document.getElementById('chat-header'),
    chatInputContainer: document.getElementById('chat-input-container'),
    emptyChat: document.getElementById('empty-chat'),
    chatUserAvatar: document.getElementById('chat-user-avatar'),
    chatUserName: document.getElementById('chat-user-name'),
    chatUserStatus: document.getElementById('chat-user-status'),
    messagesContainer: document.getElementById('messages-container'),
    
    newChatBtn: document.getElementById('new-chat-btn'),
    startNewChatBtn: document.getElementById('start-new-chat-btn'),
    newChatModal: document.getElementById('new-chat-modal'),
    searchUsers: document.getElementById('search-users'),
    usersList: document.getElementById('users-list'),
    closeModal: document.querySelector('.close-modal'),
    searchInput: document.getElementById('search-input')
};

// ============ FUNÇÕES AUXILIARES ============
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getAvatarUrl(user) {
    return user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U') + '&background=25d366&color=fff&size=50';
}

function scrollToBottom() {
    setTimeout(() => {
        DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
    }, 100);
}

// ============ GESTÃO DE USUÁRIOS ============
async function createUserIfNotExists(user) {
    const userRef = doc(db, 'chatweb', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || 'Usuário',
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            status: 'online'
        });
    } else {
        await updateDoc(userRef, {
            lastSeen: serverTimestamp(),
            status: 'online'
        });
    }
}

async function loadUsers() {
    if (!state.currentUser) return;
    
    const usersRef = collection(db, 'chatweb');
    const q = query(usersRef, where('uid', '!=', state.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    state.users = [];
    querySnapshot.forEach(doc => {
        state.users.push({ id: doc.id, ...doc.data() });
    });
    
    return state.users;
}

// ============ GESTÃO DE CHATS ============
async function createChat(userId) {
    if (!state.currentUser) return;
    
    try {
        // 1. VERIFICAR SE JÁ EXISTE UM CHAT
        const chatsRef = collection(db, 'chatweb', state.currentUser.uid, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        
        // 2. CRIAR NOVO CHAT PARA O USUÁRIO ATUAL
        const chatData = {
            participants: [state.currentUser.uid, userId],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        };
        
        const docRef = await addDoc(chatsRef, chatData);
        const chatId = docRef.id;
        
        // 3. CRIAR O MESMO CHAT PARA O OUTRO USUÁRIO
        const otherUserChatRef = collection(db, 'chatweb', userId, 'chats');
        await setDoc(doc(otherUserChatRef, chatId), {
            participants: [userId, state.currentUser.uid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        });
        
        return chatId;
        
    } catch (error) {
        console.error('Erro ao criar chat:', error);
        throw error;
    }
}

async function loadChat(chatId) {
    if (!state.currentUser) return;
    
    state.currentChatId = chatId;
    
    // Buscar informações do chat
    const chatRef = doc(db, 'chatweb', state.currentUser.uid, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) return;
    
    const chatData = chatDoc.data();
    const otherUserId = chatData.participants.find(id => id !== state.currentUser.uid);
    
    if (!otherUserId) return;
    
    // Buscar informações do outro usuário
    const userRef = doc(db, 'chatweb', otherUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        state.currentChatUser = { id: userDoc.id, ...userDoc.data() };
        updateChatHeader(state.currentChatUser);
    }
    
    // Mostrar elementos do chat
    DOM.chatHeader.style.display = 'flex';
    DOM.chatInputContainer.style.display = 'flex';
    DOM.emptyChat.style.display = 'none';
    
    // Carregar mensagens
    loadMessages(chatId);
    scrollToBottom();
}

function updateChatHeader(user) {
    DOM.chatUserAvatar.src = getAvatarUrl(user);
    DOM.chatUserName.textContent = user?.name || 'Usuário';
    DOM.chatUserStatus.textContent = user?.status === 'online' ? '🟢 Online' : '🟤 Offline';
}

// ============ GESTÃO DE MENSAGENS ============
function loadMessages(chatId) {
    // Remover listener anterior
    if (state.unsubscribeMessages) {
        state.unsubscribeMessages();
        state.unsubscribeMessages = null;
    }
    
    const messagesRef = collection(db, 'chatweb', state.currentUser.uid, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // Limpar mensagens atuais
    DOM.messages.innerHTML = '';
    
    // Escutar novas mensagens
    state.unsubscribeMessages = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                addMessageToUI(messageData);
                scrollToBottom();
            }
        });
    }, (error) => {
        console.error('Erro ao carregar mensagens:', error);
    });
}

function addMessageToUI(messageData) {
    const isSent = messageData.senderId === state.currentUser.uid;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'message-sent' : 'message-received'}`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = messageData.text || '📎 Arquivo';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(messageData.timestamp);
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    DOM.messages.appendChild(messageDiv);
}

async function sendMessage() {
    if (!state.currentChatId || !DOM.messageInput.value.trim()) return;
    
    const text = DOM.messageInput.value.trim();
    DOM.messageInput.value = '';
    
    try {
        // 1. BUSCAR INFORMAÇÕES DO CHAT ATUAL
        const chatRef = doc(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
            console.error('Chat não encontrado para o usuário atual');
            return;
        }
        
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== state.currentUser.uid);
        
        if (!otherUserId) {
            console.error('Outro usuário não encontrado no chat');
            return;
        }
        
        // 2. ADICIONAR MENSAGEM PARA O USUÁRIO ATUAL
        const messagesRef = collection(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId, 'messages');
        await addDoc(messagesRef, {
            text: text,
            senderId: state.currentUser.uid,
            timestamp: serverTimestamp(),
            read: false
        });
        
        // 3. ADICIONAR MENSAGEM PARA O OUTRO USUÁRIO
        const otherMessagesRef = collection(db, 'chatweb', otherUserId, 'chats', state.currentChatId, 'messages');
        await addDoc(otherMessagesRef, {
            text: text,
            senderId: state.currentUser.uid,
            timestamp: serverTimestamp(),
            read: false
        });
        
        // 4. ATUALIZAR ÚLTIMA MENSAGEM DO CHAT DO USUÁRIO ATUAL
        await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageTime: serverTimestamp()
        });
        
        // 5. ATUALIZAR ÚLTIMA MENSAGEM DO CHAT DO OUTRO USUÁRIO
        const otherChatRef = doc(db, 'chatweb', otherUserId, 'chats', state.currentChatId);
        const otherChatDoc = await getDoc(otherChatRef);
        
        if (otherChatDoc.exists()) {
            await updateDoc(otherChatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp()
            });
        } else {
            // Se o chat não existe para o outro usuário, criá-lo
            await setDoc(otherChatRef, {
                participants: [otherUserId, state.currentUser.uid],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: text,
                lastMessageTime: serverTimestamp()
            });
        }
        
        scrollToBottom();
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Mostrar erro mais amigável
        if (error.code === 'permission-denied') {
            alert('Erro de permissão. Verifique as regras do Firestore.');
        } else {
            alert('Erro ao enviar mensagem. Tente novamente.');
        }
    }
}

// ============ LISTA DE CHATS ============
function loadChatList() {
    if (!state.currentUser) return;
    
    // Remover listener anterior
    if (state.unsubscribeChats) {
        state.unsubscribeChats();
        state.unsubscribeChats = null;
    }
    
    const chatsRef = collection(db, 'chatweb', state.currentUser.uid, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    
    state.unsubscribeChats = onSnapshot(q, async (snapshot) => {
        DOM.chatList.innerHTML = '';
        
        if (snapshot.empty) {
            DOM.chatList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #667781;">
                    <i class="fas fa-comments" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    <p>Nenhuma conversa ainda</p>
                    <p style="font-size: 13px; margin-top: 5px;">Clique no ✏️ para iniciar um novo chat</p>
                </div>
            `;
            return;
        }
        
        for (const docSnapshot of snapshot.docs) {
            const chatData = docSnapshot.data();
            const otherUserId = chatData.participants.find(id => id !== state.currentUser.uid);
            
            if (!otherUserId) continue;
            
            const userRef = doc(db, 'chatweb', otherUserId);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) continue;
            
            const userData = userDoc.data();
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${docSnapshot.id === state.currentChatId ? 'active' : ''}`;
            
            const lastMessage = chatData.lastMessage || 'Nova conversa';
            const time = formatTime(chatData.lastMessageTime);
            
            chatItem.innerHTML = `
                <img src="${getAvatarUrl(userData)}" alt="${userData.name}">
                <div class="chat-item-content">
                    <div class="chat-item-name">${userData.name}</div>
                    <div class="chat-item-last-message">${lastMessage}</div>
                </div>
                <div class="chat-item-time">${time}</div>
            `;
            
            chatItem.addEventListener('click', () => {
                loadChat(docSnapshot.id);
                // Atualizar active
                document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
                chatItem.classList.add('active');
            });
            
            DOM.chatList.appendChild(chatItem);
        }
    }, (error) => {
        console.error('Erro ao carregar chats:', error);
    });
}

// ============ MODAL NOVO CHAT ============
async function openNewChatModal() {
    try {
        await loadUsers();
        displayUsers(state.users);
        DOM.newChatModal.style.display = 'flex';
        DOM.searchUsers.value = '';
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
    }
}

function displayUsers(users) {
    DOM.usersList.innerHTML = '';
    
    if (users.length === 0) {
        DOM.usersList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #667781;">
                <i class="fas fa-user-slash" style="font-size: 30px; margin-bottom: 10px; display: block;"></i>
                <p>Nenhum usuário encontrado</p>
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const statusDot = user.status === 'online' ? '🟢' : '⚪';
        
        userItem.innerHTML = `
            <img src="${getAvatarUrl(user)}" alt="${user.name}">
            <div class="user-item-info">
                <div class="user-item-name">${user.name}</div>
                <div class="user-item-email">${user.email}</div>
                <div class="user-item-status">${statusDot} ${user.status || 'offline'}</div>
            </div>
        `;
        
        userItem.addEventListener('click', async () => {
            try {
                const chatId = await createChat(user.id);
                if (chatId) {
                    DOM.newChatModal.style.display = 'none';
                    loadChat(chatId);
                    loadChatList();
                }
            } catch (error) {
                console.error('Erro ao criar chat:', error);
                alert('Erro ao criar chat. Tente novamente.');
            }
        });
        
        DOM.usersList.appendChild(userItem);
    });
}

// ============ EVENT LISTENERS ============

// Login
DOM.loginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        state.currentUser = result.user;
        await createUserIfNotExists(state.currentUser);
        showChatInterface();
    } catch (error) {
        console.error('Erro no login:', error);
        if (error.code === 'auth/popup-blocked') {
            alert('O popup foi bloqueado. Permita popups para este site.');
        } else {
            alert('Erro ao fazer login. Tente novamente.');
        }
    }
});

// Logout
DOM.logoutBtn.addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja sair?')) return;
    
    try {
        // Atualizar status
        if (state.currentUser) {
            const userRef = doc(db, 'chatweb', state.currentUser.uid);
            await updateDoc(userRef, { status: 'offline' });
        }
        
        await signOut(auth);
        state.currentUser = null;
        state.currentChatId = null;
        state.currentChatUser = null;
        
        if (state.unsubscribeMessages) {
            state.unsubscribeMessages();
            state.unsubscribeMessages = null;
        }
        if (state.unsubscribeChats) {
            state.unsubscribeChats();
            state.unsubscribeChats = null;
        }
        
        DOM.loginContainer.style.display = 'flex';
        DOM.chatContainer.style.display = 'none';
    } catch (error) {
        console.error('Erro no logout:', error);
    }
});

// Enviar mensagem
DOM.sendBtn.addEventListener('click', sendMessage);
DOM.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Novo Chat
DOM.newChatBtn.addEventListener('click', openNewChatModal);
DOM.startNewChatBtn.addEventListener('click', openNewChatModal);

// Fechar Modal
DOM.closeModal.addEventListener('click', () => {
    DOM.newChatModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === DOM.newChatModal) {
        DOM.newChatModal.style.display = 'none';
    }
});

// Pesquisar usuários
DOM.searchUsers.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (!searchTerm) {
        displayUsers(state.users);
        return;
    }
    
    const filtered = state.users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm) || 
        user.email?.toLowerCase().includes(searchTerm)
    );
    displayUsers(filtered);
});

// Pesquisar chats
DOM.searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const chatItems = DOM.chatList.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-item-name')?.textContent?.toLowerCase() || '';
        const message = item.querySelector('.chat-item-last-message')?.textContent?.toLowerCase() || '';
        const match = name.includes(searchTerm) || message.includes(searchTerm);
        item.style.display = match ? 'flex' : 'none';
    });
});

// ============ INTERFACE ============
function showChatInterface() {
    DOM.loginContainer.style.display = 'none';
    DOM.chatContainer.style.display = 'flex';
    
    // Atualizar informações do usuário
    DOM.userAvatar.src = getAvatarUrl(state.currentUser);
    DOM.userName.textContent = state.currentUser?.displayName || 'Usuário';
    DOM.userStatus.textContent = '🟢 Online';
    
    // Carregar chats
    loadChatList();
}

// ============ OBSERVADOR DE AUTENTICAÇÃO ============
onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.currentUser = user;
        await createUserIfNotExists(user);
        showChatInterface();
    } else {
        state.currentUser = null;
        DOM.loginContainer.style.display = 'flex';
        DOM.chatContainer.style.display = 'none';
    }
});

// ============ INICIALIZAÇÃO ============
console.log('🚀 Chat Web iniciado!');
console.log('📱 WhatsApp Clone com Firebase');
