// index.js

document.addEventListener('DOMContentLoaded', () => {
    const emailButton = document.getElementById('emailButton');
    const notificationBadge = document.getElementById('notificationBadge');
    const chatContainer = document.getElementById('chatContainer');
    const chatIframe = document.getElementById('chatIframe');
    const userUidElement = document.getElementById('userUid');
    const messagePreviewModal = document.getElementById('messagePreviewModal');
    const senderNameSpan = document.getElementById('senderName');
    const messageSnippetP = document.getElementById('messageSnippet');
    const replyBtn = document.getElementById('replyBtn');
    const closePreviewBtn = document.getElementById('closePreviewBtn');

    let unreadCount = 0;
    let currentSender = ''; // Para armazenar o remetente da última mensagem notificada

    // --- Lógica para o UID ---
    // Pega o UID do elemento invisível no HTML
    const userUid = userUidElement.dataset.uid;
    // Passa o UID para o iframe via URL (se já não estiver no HTML)
    // Isso garante que o iframe seja carregado com o UID correto.
    chatIframe.src = `chat.html?uid=${userUid}`;


    // --- Lógica de Notificação ---

    // Função para atualizar o contador de notificações
    function updateNotificationBadge() {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'inline-block'; // Mostra o badge
        } else {
            notificationBadge.textContent = '0';
            notificationBadge.style.display = 'none'; // Esconde o badge
        }
    }

    // Ouvinte de evento para mensagens vindas do iframe (chat.html)
    window.addEventListener('message', (event) => {
        // Verifica a origem para segurança (importante em produção!)
        // if (event.origin !== 'https://seusite.com.br') return; // Exemplo de verificação de origem

        const messageData = event.data;

        // Se a mensagem for sobre uma nova notificação de chat
        if (messageData.type === 'newMessage' && messageData.sender && messageData.snippet) {
            unreadCount++;
            currentSender = messageData.sender; // Armazena o remetente
            updateNotificationBadge();

            // Mostra o modal de pré-visualização
            senderNameSpan.textContent = messageData.sender;
            messageSnippetP.textContent = messageData.snippet;
            messagePreviewModal.style.display = 'block';
        }
        // Se a mensagem for para zerar as notificações (ex: usuário abriu o chat)
        else if (messageData.type === 'clearNotifications') {
            unreadCount = 0;
            updateNotificationBadge();
            messagePreviewModal.style.display = 'none'; // Esconde o modal se estava aberto
        }
    });

    // --- Lógica do Botão de E-mail/Notificação ---

    emailButton.addEventListener('click', () => {
        // Ao clicar no botão, mostra o chat e zera as notificações
        chatContainer.style.display = 'block';
        unreadCount = 0; // Zera as notificações ao abrir o chat
        updateNotificationBadge();
        messagePreviewModal.style.display = 'none'; // Esconde o modal

        // Foca no iframe do chat para que o usuário possa interagir imediatamente
        chatIframe.contentWindow.focus();

        // Envia uma mensagem para o iframe indicando que o chat foi aberto,
        // caso o chat precise saber disso (ex: para parar de enviar notificações)
        chatIframe.contentWindow.postMessage({ type: 'chatOpened' }, '*'); // Use o domínio do seu iframe em produção!
    });

    // --- Lógica do Modal de Pré-visualização ---

    replyBtn.addEventListener('click', () => {
        // Ao clicar em responder, abre o chat e pode pré-selecionar o remetente
        chatContainer.style.display = 'block';
        unreadCount = 0;
        updateNotificationBadge();
        messagePreviewModal.style.display = 'none';

        chatIframe.contentWindow.focus();
        // Envia uma mensagem para o iframe para indicar quem deve ser respondido
        chatIframe.contentWindow.postMessage({ type: 'replyTo', sender: currentSender }, '*'); // Use o domínio do seu iframe em produção!
    });

    closePreviewBtn.addEventListener('click', () => {
        messagePreviewModal.style.display = 'none';
        // As notificações permanecem até o chat ser aberto
    });

    // Opcional: Fechar o chatContainer clicando fora dele ou com um botão de fechar dentro do iframe
    // Por simplicidade, não incluído aqui, mas seria bom para UX.
});
