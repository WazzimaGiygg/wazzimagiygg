// server.js
const express = require('express');
const fetch = require('node-fetch'); // Necessário para fazer requisições HTTP dentro do Node.js
const bodyParser = require('body-parser'); // Para parsear o corpo das requisições JSON
const cors = require('cors'); // Para permitir que seu frontend acesse o backend de domínios diferentes

const app = express();
const port = 3000; // Você pode escolher outra porta se 3000 estiver em uso

// --- Suas chaves do JSONBin.io ---
// Por favor, substitua pelos seus valores reais.
// MANTENHA SUA CHAVE MESTRA EM SEGURANÇA E NÃO A EXPONHA NO CÓDIGO DO LADO DO CLIENTE (HTML/JS DO NAVEGADOR)!
const JSONBIN_MASTER_KEY = '$2a$10$/pYrh2SP/V4YNZTFW/elIOorkCNqmqkrOJexb/qq5HCSptdd3RcfqI'; // <<< SUBSTITUA PELA SUA CHAVE MESTRA REAL
const JSONBIN_BIN_ID = '$2a$10$yYkleiX8VSZNdbcsN8o6iuVm56ZSSHYExMh.OZ8DW07Qx5B1OJpj6'; // <<< SUBSTITUA PELO ID DO SEU BIN REAL NO JSONBIN.IO

// Middleware para parsear o corpo das requisições POST como JSON
app.use(bodyParser.json());

// Middleware para CORS - Permitir que o frontend (wzzm.org ou localhost) acesse o backend
// É importante adicionar todos os domínios onde seu frontend pode estar rodando.
app.use(cors({
    origin: ['http://localhost', 'http://localhost:8080', 'https://wzzm.org', 'http://wzzm.org'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Rota de teste simples para verificar se o backend está rodando
app.get('/', (req, res) => {
    res.send('Backend do Fórum está funcionando!');
});

// --- Rota para OBTER as mensagens do fórum ---
app.get('/api/forum/posts', async (req, res) => {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Bin-Meta': 'false' // Não queremos os metadados do bin, apenas o conteúdo
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro ao obter posts do JSONBin.io:', response.status, errorText);
            return res.status(response.status).send(`Erro ao obter posts: ${errorText}`);
        }

        const data = await response.json();
        // O JSONBin.io armazena o que você envia. Assumimos que você salva os posts
        // dentro de um objeto JSON com uma chave 'posts', que é um array.
        res.json(data.posts || []); // Retorna o array de posts, ou um array vazio se não houver
    } catch (error) {
        console.error('Erro no servidor ao obter posts do fórum:', error);
        res.status(500).send('Erro interno do servidor ao obter posts.');
    }
});

// --- Rota para ENVIAR uma nova mensagem para o fórum ---
// IMPORTANTE: Para produção, você deve verificar o token de autenticação do Firebase aqui
// para garantir que apenas usuários autenticados possam postar.
app.post('/api/forum/posts', async (req, res) => {
    // Extrai os dados da requisição. Note que authorUid é importante para rastrear quem postou.
    const { subject, content, authorUid } = req.body;

    if (!subject || !content || !authorUid) {
        return res.status(400).send('Assunto, conteúdo e UID do autor são obrigatórios.');
    }

    try {
        // 1. Obter os posts existentes do JSONBin.io
        // É necessário ler o conteúdo atual do bin para adicionar a nova postagem
        // e depois sobrescrever o bin com o conteúdo atualizado.
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });

        if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.error('Erro ao ler posts existentes do JSONBin.io:', getResponse.status, errorText);
            return res.status(getResponse.status).send(`Erro ao ler posts existentes: ${errorText}`);
        }

        const existingData = await getResponse.json();
        // Garante que 'posts' é um array, mesmo que o bin esteja vazio ou não tenha a chave 'posts'
        const posts = existingData.posts || [];

        // 2. Criar a nova postagem
        const newPost = {
            id: Date.now().toString(), // Um ID simples baseado no timestamp atual
            subject: subject,
            content: content,
            authorUid: authorUid, // O UID do usuário Firebase que fez a postagem
            timestamp: new Date().toISOString() // Data e hora da postagem no formato ISO 8601
        };

        // 3. Adicionar a nova postagem ao array (no início para os mais recentes aparecerem primeiro)
        posts.unshift(newPost);

        // 4. Salvar o array atualizado de volta no JSONBin.io
        // Usamos PUT para substituir o conteúdo do bin existente.
        const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Bin-Meta': 'false'
            },
            body: JSON.stringify({ posts: posts }) // Envia o array atualizado dentro de um objeto com a chave 'posts'
        });

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            console.error('Erro ao salvar posts no JSONBin.io:', putResponse.status, errorText);
            return res.status(putResponse.status).send(`Erro ao salvar posts: ${errorText}`);
        }

        // Se tudo deu certo, retorna a nova postagem com status 201 Created
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Erro no servidor ao enviar postagem do fórum:', error);
        res.status(500).send('Erro interno do servidor ao enviar postagem.');
    }
});

// Inicia o servidor e o faz "escutar" por requisições na porta especificada
app.listen(port, () => {
    console.log(`Servidor Express rodando em http://localhost:${port}`);
});
