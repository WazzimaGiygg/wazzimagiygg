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
    unsubscribeChats: null,
    typingTimeout: null,
    isTyping: false
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
    searchInput: document.getElementById('search-input'),
    
    // Novos elementos para funcionalidades adicionais
    emojiBtn: document.getElementById('emoji-btn'),
    attachBtn: document.querySelector('.fa-paperclip')?.parentElement
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

function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getAvatarUrl(user) {
    return user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U') + '&background=25d366&color=fff&size=50';
}

function scrollToBottom() {
    setTimeout(() => {
        if (DOM.messagesContainer) {
            DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
        }
    }, 100);
}

// ============ FUNÇÃO PARA NOTIFICAÇÕES ============
async function sendNotification(title, body, icon) {
    try {
        // Verificar se o navegador suporta notificações
        if (!('Notification' in window)) {
            console.log('Notificações não suportadas');
            return;
        }

        // Verificar permissão
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon || 'https://via.placeholder.com/50',
                sound: true
            });
        } else if (Notification.permission !== 'denied') {
            // Pedir permissão
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: icon || 'https://via.placeholder.com/50'
                });
            }
        }
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
}

// ============ FUNÇÃO PARA MARCAR MENSAGENS COMO LIDAS ============
async function markMessagesAsRead(chatId) {
    if (!state.currentUser) return;
    
    try {
        const messagesRef = collection(db, 'chatweb', state.currentUser.uid, 'chats', chatId, 'messages');
        const q = query(messagesRef, where('read', '==', false), where('senderId', '!=', state.currentUser.uid));
        const snapshot = await getDocs(q);
        
        const updatePromises = snapshot.docs.map(async (doc) => {
            await updateDoc(doc.ref, { read: true });
        });
        
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
    }
}

// ============ FUNÇÃO PARA INDICADOR DE DIGITANDO ============
async function setTypingStatus(chatId, isTyping) {
    if (!state.currentUser || !chatId) return;
    
    try {
        const chatRef = doc(db, 'chatweb', state.currentUser.uid, 'chats', chatId);
        await updateDoc(chatRef, {
            typing: isTyping,
            typingUser: isTyping ? state.currentUser.uid : null
        });
    } catch (error) {
        console.error('Erro ao atualizar status de digitação:', error);
    }
}

function handleTyping() {
    if (!state.currentChatId) return;
    
    // Enviar status de digitando
    setTypingStatus(state.currentChatId, true);
    
    // Limpar timeout anterior
    if (state.typingTimeout) {
        clearTimeout(state.typingTimeout);
    }
    
    // Definir timeout para parar de mostrar "digitando"
    state.typingTimeout = setTimeout(() => {
        setTypingStatus(state.currentChatId, false);
    }, 2000);
}

// ============ FUNÇÃO PARA EMOJIS ============
let emojiPicker = null;

async function loadEmojiPicker() {
    try {
        // Carregar a biblioteca de emojis dinamicamente
        if (typeof window.EmojiButton !== 'undefined') {
            emojiPicker = new window.EmojiButton.EmojiButton({
                position: 'top-start',
                theme: 'light',
                autoHide: true
            });
            
            emojiPicker.on('emoji', (emoji) => {
                const input = DOM.messageInput;
                const start = input.selectionStart;
                const end = input.selectionEnd;
                const text = input.value;
                input.value = text.substring(0, start) + emoji + text.substring(end);
                input.focus();
                input.selectionStart = input.selectionEnd = start + emoji.length;
                handleTyping();
            });
            
            return emojiPicker;
        } else {
            console.warn('Biblioteca de emojis não carregada');
            return null;
        }
    } catch (error) {
        console.error('Erro ao carregar seletor de emojis:', error);
        return null;
    }
}

// ============ FUNÇÃO PARA UPLOAD DE IMAGENS ============
async function handleImageUpload(file) {
    if (!state.currentChatId || !file) return;
    
    try {
        // Aqui você pode adicionar upload para Firebase Storage
        // Por enquanto, vamos simular com um link
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageDataUrl = e.target.result;
            
            // Enviar a imagem como mensagem
            const messagesRef = collection(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId, 'messages');
            const chatRef = doc(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId);
            const chatDoc = await getDoc(chatRef);
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(id => id !== state.currentUser.uid);
            
            const messageData = {
                text: '📷 Imagem',
                imageUrl: imageDataUrl,
                senderId: state.currentUser.uid,
                timestamp: serverTimestamp(),
                read: false,
                isImage: true
            };
            
            // Adicionar para ambos os usuários
            const otherMessagesRef = collection(db, 'chatweb', otherUserId, 'chats', state.currentChatId, 'messages');
            
            await Promise.all([
                addDoc(messagesRef, messageData),
                addDoc(otherMessagesRef, messageData)
            ]);
            
            // Atualizar última mensagem
            await updateDoc(chatRef, {
                lastMessage: '📷 Imagem',
                lastMessageTime: serverTimestamp()
            });
            
            scrollToBottom();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Erro ao enviar imagem. Tente novamente.');
    }
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
    
    try {
        const usersRef = collection(db, 'chatweb');
        const q = query(usersRef, where('uid', '!=', state.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        state.users = [];
        querySnapshot.forEach(doc => {
            state.users.push({ id: doc.id, ...doc.data() });
        });
        
        return state.users;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        throw error;
    }
}

// ============ GESTÃO DE CHATS ============
async function createChat(userId) {
    if (!state.currentUser) return;
    
    try {
        // Verificar se já existe um chat
        const chatsRef = collection(db, 'chatweb', state.currentUser.uid, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        
        // Criar novo chat para o usuário atual
        const chatData = {
            participants: [state.currentUser.uid, userId],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            typing: false,
            typingUser: null
        };
        
        const docRef = await addDoc(chatsRef, chatData);
        const chatId = docRef.id;
        
        // Criar o mesmo chat para o outro usuário
        const otherUserChatRef = collection(db, 'chatweb', userId, 'chats');
        await setDoc(doc(otherUserChatRef, chatId), {
            participants: [userId, state.currentUser.uid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            typing: false,
            typingUser: null
        });
        
        return chatId;
    } catch (error) {
        console.error('Erro ao criar chat:', error);
        throw error;
    }
}

async function loadChat(chatId) {
    if (!state.currentUser) return;
    
    try {
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
        
        // Marcar mensagens como lidas
        await markMessagesAsRead(chatId);
        
        // Carregar mensagens
        loadMessages(chatId);
        scrollToBottom();
    } catch (error) {
        console.error('Erro ao carregar chat:', error);
    }
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
    state.unsubscribeMessages = onSnapshot(q, async (snapshot) => {
        let hasNewMessage = false;
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                addMessageToUI(messageData);
                hasNewMessage = true;
                
                // Notificar se a mensagem for de outro usuário
                if (messageData.senderId !== state.currentUser.uid) {
                    const title = state.currentChatUser?.name || 'Usuário';
                    const body = messageData.isImage ? '📷 Imagem' : messageData.text;
                    sendNotification(title, body, state.currentChatUser?.photoURL);
                }
            }
        });
        
        if (hasNewMessage) {
            scrollToBottom();
            // Marcar como lidas as novas mensagens
            if (state.currentChatId) {
                await markMessagesAsRead(state.currentChatId);
            }
        }
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
    
    // Verificar se é uma imagem
    if (messageData.isImage && messageData.imageUrl) {
        const img = document.createElement('img');
        img.src = messageData.imageUrl;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.borderRadius = '8px';
        img.style.cursor = 'pointer';
        img.onclick = () => {
            window.open(messageData.imageUrl, '_blank');
        };
        textDiv.appendChild(img);
    } else {
        textDiv.textContent = messageData.text || '📎 Arquivo';
    }
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const timeText = formatMessageTime(messageData.timestamp);
    timeDiv.textContent = timeText + (isSent && messageData.read ? ' ✓✓' : '');
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    DOM.messages.appendChild(messageDiv);
}

async function sendMessage() {
    if (!state.currentChatId || !DOM.messageInput.value.trim()) return;
    
    const text = DOM.messageInput.value.trim();
    DOM.messageInput.value = '';
    
    // Parar indicador de digitando
    await setTypingStatus(state.currentChatId, false);
    
    try {
        // Buscar informações do chat
        const chatRef = doc(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
            console.error('Chat não encontrado');
            return;
        }
        
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== state.currentUser.uid);
        
        if (!otherUserId) {
            console.error('Outro usuário não encontrado');
            return;
        }
        
        // Criar objeto da mensagem
        const messageData = {
            text: text,
            senderId: state.currentUser.uid,
            timestamp: serverTimestamp(),
            read: false,
            isImage: false
        };
        
        // Adicionar mensagem para ambos os usuários
        const currentMessagesRef = collection(db, 'chatweb', state.currentUser.uid, 'chats', state.currentChatId, 'messages');
        const otherMessagesRef = collection(db, 'chatweb', otherUserId, 'chats', state.currentChatId, 'messages');
        
        await Promise.all([
            addDoc(currentMessagesRef, messageData),
            addDoc(otherMessagesRef, messageData)
        ]);
        
        // Atualizar última mensagem para ambos
        const updateData = {
            lastMessage: text,
            lastMessageTime: serverTimestamp()
        };
        
        const otherChatRef = doc(db, 'chatweb', otherUserId, 'chats', state.currentChatId);
        
        await Promise.all([
            updateDoc(chatRef, updateData).catch(async () => {
                await setDoc(chatRef, {
                    ...chatData,
                    ...updateData
                });
            }),
            updateDoc(otherChatRef, updateData).catch(async () => {
                await setDoc(otherChatRef, {
                    participants: [otherUserId, state.currentUser.uid],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    ...updateData
                });
            })
        ]);
        
        scrollToBottom();
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
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
            const time = formatMessageTime(chatData.lastMessageTime);
            
            // Indicador de digitando
            const isTyping = chatData.typing && chatData.typingUser !== state.currentUser.uid;
            const typingText = isTyping ? '...digitando' : '';
            
            chatItem.innerHTML = `
                <img src="${getAvatarUrl(userData)}" alt="${userData.name}">
                <div class="chat-item-content">
                    <div class="chat-item-name">${userData.name}</div>
                    <div class="chat-item-last-message">${typingText || lastMessage}</div>
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

// Indicador de digitando
DOM.messageInput.addEventListener('input', handleTyping);

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

// Botão de Emojis
if (DOM.emojiBtn) {
    DOM.emojiBtn.addEventListener('click', async () => {
        if (!emojiPicker) {
            await loadEmojiPicker();
        }
        if (emojiPicker) {
            emojiPicker.picker.toggle(DOM.emojiBtn);
        }
    });
}

// Upload de imagens
if (DOM.attachBtn) {
    DOM.attachBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleImageUpload(file);
            }
        };
        input.click();
    });
}

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
    
    // Pedir permissão para notificações
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
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

// Carregar seletor de emojis em segundo plano
setTimeout(() => {
    loadEmojiPicker();
}, 2000);
