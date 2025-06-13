// jsonbin-api.js (Este arquivo rodará no navegador)

// Defina seu ID do Bin e, opcionalmente, sua Access Key para bins públicos/leitura
// ATENÇÃO: Nunca coloque a X-Master-Key aqui se o seu bin tiver dados sensíveis.
// Ela seria exposta no navegador.
const BIN_ID = 'SEU_ID_DO_BIN_AQUI'; // <--- OBRIGATÓRIO: Substitua pelo seu ID real!
// const ACCESS_KEY = 'SUA_ACCESS_KEY_AQUI'; // Opcional: para bins públicos com leitura via Access Key

export async function carregarMensagens() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'GET',
            headers: {
                // 'X-Access-Key': ACCESS_KEY, // Descomente e use se tiver uma Access Key para leitura
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao carregar mensagens do JSONBin: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // JSONBin.io armazena o conteúdo do bin dentro da propriedade 'record'
        return data.record;

    } catch (error) {
        console.error('Erro ao carregar mensagens (Frontend):', error);
        throw error; // Re-lança para que a função chamadora possa lidar com isso
    }
}

export async function salvarMensagens(novasMensagens) {
    try {
        // ATENÇÃO: Para salvar/atualizar (PUT) em um bin no JSONBin.io,
        // a X-Master-Key é NECESSÁRIA.
        // Colocar a X-Master-Key diretamente no frontend é ALTAMENTE NÃO RECOMENDADO
        // para bins com dados que precisam de segurança, pois ela ficará visível no código do navegador.
        // Use esta abordagem APENAS se o bin for para dados não sensíveis ou testes.
        const MASTER_KEY_FRONTEND_EXPOSED = 'SUA_CHAVE_MESTRA_AQUI'; // <--- RISCO DE SEGURANÇA!

        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT', // PUT para atualizar o bin existente
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY_FRONTEND_EXPOSED // <-- Exposta no navegador!
            },
            body: JSON.stringify(novasMensagens)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar mensagens no JSONBin: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Mensagens salvas com sucesso no JSONBin:', data.record);
        return data.record;

    } catch (error) {
        console.error('Erro ao salvar mensagens (Frontend):', error);
        throw error;
    }
}
