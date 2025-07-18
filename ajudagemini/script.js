document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const sendButton = document.getElementById('sendButton');
    const responseDiv = document.getElementById('response');
    // Adicionado: Referência ao elemento do spinner
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Substitua 'AIzaSyClm0p4HeiZteCYJiKbJbop3dQYYZcWzhg' pela sua chave real da API.
    // ATENÇÃO: Em um ambiente de produção, NUNCA exponha sua chave API no frontend.
    // Use um backend para intermediar as chamadas.
    const GEMINI_API_KEY = 'AIzaSyClm0p4HeiZteCYJiKbJbop3dQYYZcWzhg'; // <-- Cole a chave aqui

    // URL do endpoint da API do Gemini
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    sendButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            responseDiv.textContent = 'Por favor, digite uma pergunta.';
            return;
        }

        responseDiv.textContent = 'Carregando...';
        // Mostra o spinner e desabilita o botão
        if (loadingSpinner) { // Garante que o spinner existe
            loadingSpinner.style.display = 'inline-block';
        }
        sendButton.disabled = true; // Desabilita o botão para evitar cliques múltiplos

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Melhora a mensagem de erro para incluir o status e a mensagem da API, se disponível
                throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                responseDiv.textContent = data.candidates[0].content.parts[0].text;
            } else {
                responseDiv.textContent = 'Nenhuma resposta válida recebida da API.';
            }

        } catch (error) {
            console.error('Erro ao chamar a API do Gemini:', error);
            responseDiv.textContent = `Erro: ${error.message}. Verifique o console para mais detalhes.`;
        } finally {
            // Este bloco é executado SEMPRE, independentemente de sucesso ou erro
            // Esconde o spinner e reabilita o botão
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            sendButton.disabled = false; // Reabilita o botão
        }
    });
});
