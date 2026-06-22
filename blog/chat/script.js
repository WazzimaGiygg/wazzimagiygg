import { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged,
         collection, doc, setDoc, getDoc, getDocs, query, where,
         onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp } from './firebase-config.js';

// Estado da aplicação
let currentUser = null;
let currentChat = null;
let chats = [];
let users = [];

// Elementos DOM
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const chatList = document.getElementById('chat-list');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatHeader = document.getElementById('chat-header');
const chatInputContainer = document.getElementById('chat-input-container');
const emptyChat = document.getElementById('empty-chat');
const newChatBtn = document.getElementById('new-chat-btn');
const newChatModal = document.getElementById('new-chat-modal');
const searchUsers = document.getElementById('search-users');
const usersList = document.getElementById('users-list');
const closeModal = document.querySelector('.close-modal');

// Função para criar usuário no Firestore
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
            status: 'online',
            settings: {
                theme: 'light',
                notifications: true,
                language: 'pt-BR'
            }
        });
    } else {
        // Atualizar último acesso
        await updateDoc(userRef, {
            lastSeen: serverTimestamp(),
            status: 'online'
        });
    }
}

// Função para carregar usuários (exceto o atual)
async function loadUsers() {
    const usersRef = collection(db, 'chatweb');
    const q = query(usersRef, where('uid', '!=', currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    users = [];
    querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
}

// Função para iniciar um chat
async function startChat(userId) {
    // Verificar se já existe um chat entre os dois usuários
    const chatsRef = collection(db, 'chatweb', currentUser.uid, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    let chatId = null;
    
    if (!querySnapshot.empty) {
        // Chat já existe
        chatId = querySnapshot.docs[0].id;
    } else {
        // Criar novo chat
        const chatData = {
            participants: [currentUser.uid, userId],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        };
        
        const docRef = await addDoc(chatsRef, chatData);
        chatId = docRef.id;
        
        // Adicionar referência do chat para o outro usuário
        const otherUserChatRef = collection(db, 'chatweb', userId, 'chats');
        await addDoc(otherUserChatRef, chatData);
    }
    
    // Carregar o chat
    loadChat(chatId);
    closeModal.style.display = 'none';
}

// Função para carregar um chat específico
async function loadChat(chatId) {
    currentChat = chatId;
    
    // Buscar informações do chat
    const chatRef = doc(db, 'chatweb', currentUser.uid, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
        
        // Buscar informações do outro usuário
        const userRef = doc(db, 'chatweb', otherUserId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('chat-user-avatar').src = userData.photoURL || 'https://via.placeholder.com/40';
            document.getElementById('chat-user-name').textContent = userData.name;
            document.getElementById('chat-user-status').textContent = userData.status || 'offline';
        }
        
        // Mostrar elementos do chat
        chatHeader.style.display = 'flex';
        chatInputContainer.style.display = 'flex';
        emptyChat.style.display = 'none';
        
        // Carregar mensagens
        loadMessages(chatId);
    }
}

// Função para carregar mensagens de um chat
function loadMessages(chatId) {
    const messagesRef = collection(db, 'chatweb', currentUser.uid, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // Limpar mensagens atuais
    messages.innerHTML = '';
    
    // Escutar novas mensagens em tempo real
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                addMessageToUI(messageData);
            }
        });
        
        // Scroll para o final
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    });
}

// Função para adicionar mensagem ao UI
function addMessageToUI(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.senderId === currentUser.uid ? 'message-sent' : 'message-received'}`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = messageData.text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const date = messageData.timestamp?.toDate() || new Date();
    timeDiv.textContent = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    messages.appendChild(messageDiv);
}

// Função para enviar mensagem
async function sendMessage() {
    if (!currentChat || !messageInput.value.trim()) return;
    
    const text = messageInput.value.trim();
    messageInput.value = '';
    
    // Adicionar mensagem ao Firestore
    const messagesRef = collection(db, 'chatweb', currentUser.uid, 'chats', currentChat, 'messages');
    await addDoc(messagesRef, {
        text: text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
    });
    
    // Adicionar mensagem para o outro usuário
    const chatRef = doc(db, 'chatweb', currentUser.uid, 'chats', currentChat);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
    
    if (otherUserId) {
        const otherMessagesRef = collection(db, 'chatweb', otherUserId, 'chats', currentChat, 'messages');
        await addDoc(otherMessagesRef, {
            text: text,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
            read: false
        });
    }
    
    // Atualizar última mensagem do chat
    await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
    });
    
    // Atualizar para o outro usuário
    if (otherUserId) {
        const otherChatRef = doc(db, 'chatweb', otherUserId, 'chats', currentChat);
        await updateDoc(otherChatRef, {
            lastMessage: text,
            lastMessageTime: serverTimestamp()
        });
    }
    
    // Scroll para o final
    const container = document.getElementById('messages-container');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// Função para carregar lista de chats
function loadChatList() {
    const chatsRef = collection(db, 'chatweb', currentUser.uid, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    
    onSnapshot(q, async (snapshot) => {
        chatList.innerHTML = '';
        
        for (const docSnapshot of snapshot.docs) {
            const chatData = docSnapshot.data();
            const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
            
            if (otherUserId) {
                const userRef = doc(db, 'chatweb', otherUserId);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const chatItem = document.createElement('div');
                    chatItem.className = 'chat-item';
                    if (docSnapshot.id === currentChat) {
                        chatItem.classList.add('active');
                    }
                    
                    chatItem.innerHTML = `
                        <img src="${userData.photoURL || 'https://via.placeholder.com/50'}" alt="${userData.name}">
                        <div class="chat-item-content">
                            <div class="chat-item-name">${userData.name}</div>
                            <div class="chat-item-last-message">${chatData.lastMessage || 'Nova conversa'}</div>
                        </div>
                        <div class="chat-item-time">${chatData.lastMessageTime?.toDate()?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || ''}</div>
                    `;
                    
                    chatItem.addEventListener('click', () => {
                        loadChat(docSnapshot.id);
                    });
                    
                    chatList.appendChild(chatItem);
                }
            }
        }
    });
}

// Event Listeners

// Login com Google
loginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        await createUserIfNotExists(currentUser);
        showChatInterface();
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login. Tente novamente.');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        currentUser = null;
        currentChat = null;
        loginContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    } catch (error) {
        console.error('Erro no logout:', error);
    }
});

// Enviar mensagem
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Novo Chat
newChatBtn.addEventListener('click', async () => {
    await loadUsers();
    displayUsers(users);
    newChatModal.style.display = 'flex';
});

// Fechar Modal
closeModal.addEventListener('click', () => {
    newChatModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === newChatModal) {
        newChatModal.style.display = 'none';
    }
});

// Pesquisar usuários
searchUsers.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    displayUsers(filteredUsers);
});

// Display usuários na lista
function displayUsers(usersListData) {
    usersList.innerHTML = '';
    
    usersListData.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="${user.name}">
            <div>
                <div class="user-item-name">${user.name}</div>
                <div class="user-item-email">${user.email}</div>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            startChat(user.id);
        });
        
        usersList.appendChild(userItem);
    });
}

// Mostrar interface do chat
function showChatInterface() {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    
    // Atualizar informações do usuário
    userAvatar.src = currentUser.photoURL || 'https://via.placeholder.com/40';
    userName.textContent = currentUser.displayName || 'Usuário';
    
    // Carregar lista de chats
    loadChatList();
}

// Observar estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        createUserIfNotExists(user);
        showChatInterface();
    } else {
        currentUser = null;
        loginContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
});

// Inicialização
console.log('Chat Web iniciado!');
