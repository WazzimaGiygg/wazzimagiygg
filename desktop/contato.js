// Adicione perto dos outros elementos do painel esquerdo:
const userList = document.getElementById('user-list');
const showChatsBtn = document.getElementById('show-chats');
const showUsersBtn = document.getElementById('show-users');
const leftPanelTitle = document.getElementById('left-panel-title');

// Alterna entre lista de conversas e de usuários
showChatsBtn.addEventListener('click', () => {
    recentChatsList.style.display = '';
    userList.style.display = 'none';
    leftPanelTitle.textContent = "Conversas Recentes";
    showChatsBtn.classList.add('mdl-button--colored');
    showUsersBtn.classList.remove('mdl-button--colored');
});
showUsersBtn.addEventListener('click', () => {
    recentChatsList.style.display = 'none';
    userList.style.display = '';
    leftPanelTitle.textContent = "Usuários";
    showChatsBtn.classList.remove('mdl-button--colored');
    showUsersBtn.classList.add('mdl-button--colored');
});

// Função para listar todos os usuários (menos o logado)
async function loadAllUsers() {
    userList.innerHTML = '';
    try {
        const snapshot = await firestore.collection('users').get();
        snapshot.forEach(doc => {
            const user = doc.data();
            // Não mostra o usuário logado
            if (currentUser && user.uid === currentUser.uid) return;

            const listItem = document.createElement('li');
            listItem.classList.add('chat-list-item');
            listItem.style.cursor = 'pointer';

            listItem.innerHTML = `
                <img src="${user.profilePictureUrl || 'https://via.placeholder.com/40'}" alt="${user.name || user.email} Avatar">
                <div class="chat-list-item-info">
                    <strong>${user.name || user.email}</strong>
                    <span style="font-size:12px;color:#aaa;">${user.uid}</span>
                </div>
            `;

            // Clique para iniciar chat
            listItem.addEventListener('click', async () => {
                const chatId = await getOrCreateChat(user.uid);
                if (chatId) {
                    // Ativar chat na UI
                    showChatsBtn.click(); // Troca para aba de conversas
                    // Opcional: selecionar o chat criado/aberto
                    setTimeout(() => {
                        const item = document.querySelector(`.chat-list-item[data-chat-id="${chatId}"]`);
                        if (item) item.click();
                    }, 500); // Espera a lista recarregar
                }
            });

            userList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        userList.innerHTML = `<li style="color:red;padding:10px;">Erro ao carregar usuários.</li>`;
    }
}

// Chame após login
auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
        await createUserProfileDocument(user);
        // ... seu código ...
        loadRecentChats();
        loadAllUsers();
    } else {
        userList.innerHTML = '';
    }
});
