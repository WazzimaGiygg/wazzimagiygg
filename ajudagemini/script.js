document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const sendButton = document.getElementById('sendButton');
    const responseDiv = document.getElementById('response');

    // Substitua 'AIzaSyClm0p4HeiZteCYJiKbJbop3dQYYZcWzhg' pela sua chave real da API.
    // ATENÇÃO: Em um ambiente de produção, NUNCA exponha sua chave API no frontend.
    // Use um backend para intermediar as chamadas.
    const GEMINI_API_KEY = 'AIzaSyClm0p4HeiZteCYJiKbJbop3dQYYZcWzhg'; // <<<<<<< IMPORTANTE

    // URL do endpoint da API do Gemini
    // Este é um exemplo simplificado. O uso real pode exigir autenticação mais robusta
    // e endpoints específicos para os modelos do Gemini (ex: text-bison, gemini-pro).
    // Consulte a documentação oficial da Google AI para os endpoints corretos.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    // A linha acima é um exemplo para o modelo Gemini-Pro. Verifique a documentação para o modelo específico que você deseja usar.

    sendButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            responseDiv.textContent = 'Por favor, digite uma pergunta.';
            return;
        }

        responseDiv.textContent = 'Carregando...';

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
                // Tenta ler o corpo da resposta para mais detalhes sobre o erro
                const errorData = await response.json();
                throw new Error(`Erro na API: ${response.status} - ${errorData.error.message || 'Erro desconhecido'}`);
            }

            const data = await response.json();

            // A estrutura da resposta pode variar. Consulte a documentação do Gemini API.
            // Este é um exemplo comum para `generateContent`.
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                responseDiv.textContent = data.candidates[0].content.parts[0].text;
            } else {
                responseDiv.textContent = 'Nenhuma resposta válida recebida da API.';
            }

        } catch (error) {
            console.error('Erro ao chamar a API do Gemini:', error);
            responseDiv.textContent = `Erro: ${error.message}. Verifique o console para mais detalhes.`;
        }
    });
});
