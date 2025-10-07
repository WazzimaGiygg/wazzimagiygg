// =========================================================================
// VARIÁVEIS DE REFERÊNCIA (AJUSTE CONFORME SEU PROJETO)
// =========================================================================
const db = firebase.firestore();
const currentArticleId = 'seu_id_de_artigo_aqui'; // ID do artigo que está sendo editado (você deve obter este ID dinamicamente)
const articleContentFieldName = 'conteudo'; // O nome do campo no seu documento 'artigos' que guarda o HTML/código

// Simulação da obtenção do conteúdo do editor (Use o método real do seu editor, ex: CKEditor, Quill)
function getEditorContent() {
    // Substitua 'document.getElementById("article-editor").value' pela chamada correta ao seu editor.
    return document.getElementById("article-editor").value;
}

// =========================================================================
// FUNÇÃO PRINCIPAL: SALVAR ARTIGO E CRIAR HISTÓRICO (COM TRANSAÇÃO)
// =========================================================================

async function saveArticleAndHistory() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Erro: Nenhum usuário logado. Impossível salvar.");
        return;
    }

    const newArticleContent = getEditorContent();
    const editSummary = document.getElementById('edit-sumario').value;

    if (!editSummary) {
        alert("Por favor, forneça um resumo da edição para o histórico.");
        return;
    }
    
    // 1. Referências aos documentos
    const articleRef = db.collection('artigos').doc(currentArticleId);
    const historyCollectionRef = articleRef.collection('historico');

    try {
        await db.runTransaction(async (transaction) => {
            
            // A. LER o documento ATUAL para obter o conteúdo antigo
            const articleDoc = await transaction.get(articleRef);

            if (!articleDoc.exists) {
                throw new Error("O documento do artigo não existe!");
            }
            
            // Conteúdo ATUAL, que se tornará o 'conteudoAnterior' no histórico
            const oldArticleContent = articleDoc.data()[articleContentFieldName] || ''; 

            // B. ESCREVER o novo registro no HISTÓRICO (Subcoleção)
            transaction.set(historyCollectionRef.doc(), {
                motivoEdicao: editSummary,
                editadoPorUID: user.uid,
                editadoPorNome: user.displayName || 'Usuário Desconhecido', 
                dataEdicao: firebase.firestore.FieldValue.serverTimestamp(),
                // NOVO CAMPO: guarda o código que estava GRAVADO antes desta edição
                conteudoAnterior: oldArticleContent 
            });

            // C. ATUALIZAR o artigo principal com o NOVO conteúdo
            transaction.update(articleRef, {
                [articleContentFieldName]: newArticleContent, // Usa a variável dinâmica para o nome do campo
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp(),
                // ... outros campos de artigo
            });
        });

        alert("Artigo salvo e histórico criado com sucesso!");
        document.getElementById('edit-sumario').value = ''; // Limpa o resumo
        loadHistory(currentArticleId); // Recarrega a lista do histórico
        
    } catch (error) {
        console.error("Falha na transação de salvamento:", error);
        alert(`Erro ao salvar o artigo: ${error.message}`);
    }
}

// =========================================================================
// FUNÇÃO PARA VISUALIZAÇÃO: DIFERENÇA (DIFF TOOL)
// =========================================================================

/**
 * Gera um HTML que destaca as diferenças entre duas strings.
 * @param {string} text1 - O conteúdo antigo (removido)
 * @param {string} text2 - O conteúdo novo (adicionado)
 * @returns {string} - O HTML pronto para ser exibido.
 */
function generateDiffView(text1, text2) {
    if (!window.diff_match_patch) {
        return "<p style='color:red;'>Biblioteca 'diff-match-patch' não carregada.</p>";
    }
    
    const dmp = new diff_match_patch();
    
    // Calcula as diferenças entre as duas versões
    const diff = dmp.diff_main(text1, text2);
    
    // Otimiza o resultado para legibilidade (opcional, mas recomendado)
    dmp.diff_cleanupSemantic(diff);
    
    // Converte o resultado em um HTML formatado
    // ins: verde (adicionado), del: vermelho (removido)
    const html = dmp.diff_prettyHtml(diff);
    
    return `<div class="diff-view" style="white-space: pre-wrap; padding: 10px; border: 1px solid #ccc;">${html}</div>`;
}

// =========================================================================
// FUNÇÃO CONCEITUAL: CARREGAR HISTÓRICO E MOSTRAR DIFF
// =========================================================================

/**
 * Carrega e exibe a lista de histórico e configura o clique para mostrar a comparação.
 * Esta função é conceitual e deve ser adaptada à sua estrutura HTML.
 * @param {string} articleId - O ID do artigo.
 */
async function loadHistory(articleId) {
    const historyListElement = document.getElementById('historico-lista'); // ID da sua lista/div de histórico
    if (!historyListElement) return;

    historyListElement.innerHTML = "<li>Carregando histórico...</li>";
    
    const historyCollectionRef = db.collection('artigos').doc(articleId).collection('historico');
    
    // Busca todos os documentos de histórico ordenados do mais recente para o mais antigo
    const snapshot = await historyCollectionRef
        .orderBy('dataEdicao', 'desc')
        .get();

    let html = '';
    
    // O Firestore salva o documento mais recente primeiro na ordem decrescente
    // O 'conteudoAnterior' do item mais recente é o código da versão anterior.

    snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const date = data.dataEdicao ? data.dataEdicao.toDate().toLocaleString() : 'Data Desconhecida';
        
        // Cria o item da lista
        html += `
            <li class="mdl-list__item mdl-list__item--three-line" 
                data-doc-id="${doc.id}" 
                data-conteudo-anterior="${data.conteudoAnterior.replace(/"/g, '&quot;')}"
                onclick="showDiffForHistory('${doc.id}', '${articleId}')">
                <span class="mdl-list__item-primary-content">
                    <span>${date}</span>
                    <span class="mdl-list__item-text-body">${data.motivoEdicao}</span>
                </span>
                <span class="mdl-list__item-secondary-content">
                    <a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">search</i></a>
                </span>
            </li>
        `;
    });
    
    historyListElement.innerHTML = html;
}


// Função chamada ao clicar em um item do histórico
async function showDiffForHistory(historyDocId, articleId) {
    const historyDocRef = db.collection('artigos').doc(articleId).collection('historico').doc(historyDocId);

    // 1. Busca o registro de histórico CLICADO
    const clickedHistoryDoc = await historyDocRef.get();
    if (!clickedHistoryDoc.exists) return;
    
    const clickedData = clickedHistoryDoc.data();
    
    // Conteúdo A: O código QUE FOI REMOVIDO (conteúdo anterior da versão CLICADA)
    const conteudoA = clickedData.conteudoAnterior || ''; 

    // 2. Busca o conteúdo ATUAL do artigo para ser o Conteúdo B
    // Para ver o diff entre a versão clicada e a versão atual.
    const articleDoc = await db.collection('artigos').doc(articleId).get();
    const conteudoB = articleDoc.data()[articleContentFieldName] || ''; 
    
    // 3. Gera e Exibe a Comparação
    // Compara o que foi removido (A) com o que está AGORA (B)
    const diffHtml = generateDiffView(conteudoA, conteudoB);
    
    // Exibir o diff em um modal ou área específica.
    // Exemplo:
    const diffContainer = document.getElementById('diff-display-area');
    if (diffContainer) {
        diffContainer.innerHTML = diffHtml;
        // Talvez mostrar um modal aqui
        // showModal('Visualização de Diferença'); 
    } else {
        console.warn("Elemento #diff-display-area não encontrado para exibir a diferença.");
    }
}


// Exemplo de como você chamaria a função ao carregar o artigo:
// loadHistory(currentArticleId);

// Exemplo de como você chamaria a função ao clicar no botão de salvar:
// document.getElementById('btn-salvar-edicao').addEventListener('click', saveArticleAndHistory);
