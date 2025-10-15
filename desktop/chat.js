// chat.js

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');
    const currentChatUserSpan = document.getElementById('currentChatUser');

    let userId = ''; // Variável para armazenar o UID do usuário

    // --- Obter o UID da URL ---
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('uid');
    if (userId) {
        currentChatUserSpan.textContent = userId;
        // Aqui você faria a inicialização do chat, carregando mensagens
        // para este userId, conectando a um WebSocket, etc.
        console.log(`Chat inicializado para o usuário: ${userId}`);
    } else {
        currentChatUserSpan.textContent = 'Desconhecido';
        console.warn('UID do usuário não encontrado na URL.');
    }

    // --- Simulação de Recebimento de Nova Mensagem ---
    // Em um cenário real, isso viria de um WebSocket ou polling para o backend.
    function simulateNewMessage(sender, messageText) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'received');
        messageDiv.innerHTML = `<span class="sender">${sender}:</span> ${messageText}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll para o final

        // Envia notificação para o pai (index.html) se o chat não estiver visível
        // ou se o usuário não estiver na aba.
        if (window.parent && !document.hidden) { // Verifica se não está na aba para não notificar a si mesmo
            window.parent.postMessage({
                type: 'newMessage',
                sender: sender,
                snippet: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : '')
            }, '*'); // Use o domínio do seu pai em produção!
        }
    }

    // Simular o recebimento de uma nova mensagem após alguns segundos
    setTimeout(() => {
        simulateNewMessage('Suporte', 'Você tem uma nova mensagem importante sobre o seu pedido!');
    }, 5000);

    setTimeout(() => {
        simulateNewMessage('Marketing', 'Confira nossa nova promoção de verão!');
    }, 10000);

    // --- Lógica de Envio de Mensagem ---
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'sent');
            messageDiv.textContent = messageText; // A mensagem enviada é simples
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            messageInput.value = '';

            // Em um cenário real, você enviaria esta mensagem para o backend
            console.log(`Mensagem enviada por ${userId}: ${messageText}`);
        }
    });

    // --- Ouvinte para mensagens do pai (index.html) ---
    window.addEventListener('message', (event) => {
        // if (event.origin !== 'https://seusite.com.br') return; // Verificação de origem

        const messageData = event.data;

        if (messageData.type === 'chatOpened') {
            // O chat foi aberto no pai, então o chat pode parar de enviar notificações
            console.log('Chat foi aberto pelo pai. Zerando quaisquer estados de notificação internos.');
            // Se você tiver um contador interno de notificações no chat.html, zere-o aqui.
        } else if (messageData.type === 'replyTo' && messageData.sender) {
            // O pai solicitou responder a um remetente específico
            messageInput.value = `@${messageData.sender} `; // Pré-preenche o input para resposta
            messageInput.focus();
        }
    });

    // Opcional: Quando o iframe ganha foco, pode-se sinalizar ao pai para zerar as notificações
    window.addEventListener('focus', () => {
        if (window.parent) {
            window.parent.postMessage({ type: 'clearNotifications' }, '*');
        }
    });
});
