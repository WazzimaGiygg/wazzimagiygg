// index.js

document.addEventListener('DOMContentLoaded', () => {
    const openChatButton = document.getElementById('open-chat-button');
    const notificationBadge = document.getElementById('notification-badge');
    const chatPopupContainer = document.getElementById('chat-popup-container');
    const closeChatPopupButton = document.getElementById('close-chat-popup-button');
    const chatIframe = document.getElementById('chat-iframe');
    const userUidElement = document.getElementById('userUid'); // Onde seu UID está

    const newMessageModal = document.getElementById('new-message-modal');
    const modalSenderName = document.getElementById('modal-sender-name');
    const modalMessageSnippet = document.getElementById('modal-message-snippet');
    const replyMessageBtn = document.getElementById('reply-message-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');

    let unreadMessageCount = 0;
    let lastMessageSender = ''; // Para armazenar o remetente da última notificação

    // --- Carrega o UID do usuário e passa para o iframe ---
    const userUid = userUidElement.dataset.uid;
    // O UID DEVE SER OBTIDO DO SEU SISTEMA DE AUTENTICAÇÃO REAL.
    // Se o UID estiver vazio (PLACEHOLDER_UID), o chat não funcionará corretamente.
    // Exemplo: Se o usuário estiver logado com Firebase Auth:
    /*
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            chatIframe.src = `chat.html?uid=${user.uid}`;
            console.log("UID do usuário carregado no iframe:", user.uid);
        } else {
            console.warn("Nenhum usuário logado. Chat não inicializado.");
            // Você pode redirecionar para login ou mostrar uma mensagem
        }
    });
    */
    // Por enquanto, usaremos o PLACEHOLDER_UID do HTML para demonstração.
    chatIframe.src = `chat.html?uid=${userUid}`;


    // --- Funções de Notificação ---
    function updateNotificationBadge() {
        if (unreadMessageCount > 0) {
            notificationBadge.textContent = unreadMessageCount;
            notificationBadge.style.display = 'inline-block';
        } else {
            notificationBadge.textContent = '0';
            notificationBadge.style.display = 'none';
        }
    }

    function showNewMessageModal(sender, snippet) {
        modalSenderName.textContent = sender;
        modalMessageSnippet.textContent = snippet;
        newMessageModal.style.display = 'block';
        modalBackdrop.style.display = 'block';
        lastMessageSender = sender; // Guarda o remetente para a ação de responder
    }

    function hideNewMessageModal() {
        newMessageModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    }

    // --- Lógica de Comunicação entre Iframe e Pai ---
    // Ouve mensagens vindas do iframe (chat.html)
    window.addEventListener('message', (event) => {
        // MUITO IMPORTANTE: Em produção, verifique a origem do evento para segurança!
        // if (event.origin !== 'https://seudominio.com.br') { return; }

        const messageData = event.data;

        // Quando o chat envia uma nova mensagem recebida (pode ser de terceiros ou sua)
        if (messageData.type === 'chatNewMessage' && messageData.senderId && messageData.text) {
            // Se o chat NÃO ESTÁ VISÍVEL ou o usuário NÃO ESTÁ NA ABA ATIVA
            if (chatPopupContainer.style.display === 'none' || document.hidden) {
                unreadMessageCount++;
                updateNotificationBadge();
                // Mostra o popup de notificação se for uma nova mensagem de um contato
                if (messageData.senderId !== userUidElement.dataset.uid) { // Não notifica se for sua própria mensagem
                    showNewMessageModal(messageData.senderName, messageData.text);
                }
            } else {
                // Se o chat está aberto e visível, não notifica, apenas zera o badge
                // (Isso será tratado pelo foco no chat.js)
                unreadMessageCount = 0;
                updateNotificationBadge();
            }
        }
        // Quando o chat sinaliza que o usuário leu/abriu, zera as notificações
        else if (messageData.type === 'chatOpenedAndRead') {
            unreadMessageCount = 0;
            updateNotificationBadge();
            hideNewMessageModal(); // Garante que o modal esteja escondido
        }
    });

    // --- Event Listeners do Botão e Popup do Chat ---
    openChatButton.addEventListener('click', () => {
        chatPopupContainer.style.display = 'flex'; // Mostra o popup
        unreadMessageCount = 0; // Zera as notificações ao abrir o chat
        updateNotificationBadge();
        hideNewMessageModal(); // Esconde o modal de notificação

        // Envia mensagem para o iframe para que ele saiba que foi aberto
        chatIframe.contentWindow.postMessage({ type: 'parentChatOpened' }, '*'); // * em dev, domínio real em prod
        // Opcional: Foca no iframe para interação imediata
        chatIframe.contentWindow.focus();
    });

    closeChatPopupButton.addEventListener('click', () => {
        chatPopupContainer.style.display = 'none'; // Esconde o popup
        // Você pode querer enviar uma mensagem para o iframe que ele foi fechado se precisar.
        chatIframe.contentWindow.postMessage({ type: 'parentChatClosed' }, '*'); // * em dev, domínio real em prod
    });

    // --- Event Listeners do Modal de Notificação ---
    replyMessageBtn.addEventListener('click', () => {
        hideNewMessageModal(); // Esconde o modal
        chatPopupContainer.style.display = 'flex'; // Abre o chat
        unreadMessageCount = 0; // Zera notificações
        updateNotificationBadge();

        // Envia uma mensagem para o iframe para que ele possa selecionar a conversa do remetente
        chatIframe.contentWindow.postMessage({
            type: 'replyToSender',
            senderName: lastMessageSender
        }, '*'); // * em dev, domínio real em prod
        chatIframe.contentWindow.focus(); // Foca no iframe
    });

    closeModalBtn.addEventListener('click', () => {
        hideNewMessageModal();
        // As notificações permanecem no badge até o chat ser realmente aberto
    });

    modalBackdrop.addEventListener('click', () => {
        hideNewMessageModal();
    });

    // Inicializa o badge no carregamento
    updateNotificationBadge();
});
