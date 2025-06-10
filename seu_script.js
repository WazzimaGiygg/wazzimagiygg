// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260",
    measurementId: "G-PLKNZNFCQ8"
};

// Inicializa o Firebase (garante que inicialize apenas uma vez)
let app;
try {
    app = firebase.app();
} catch (e) {
    app = firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const auth = firebase.auth(); // Se você estiver usando autenticação

// Referências aos elementos HTML
const articlesListDiv = document.getElementById('articles-list');
// Note: Changed id="loading-message" to a class, and updated CSS accordingly
// if you still have an element with id="loading-message", it will be referenced here
const loadingMessage = document.getElementById('loading-message');
const errorDisplay = document.getElementById('error-display');
const searchTermInput = document.getElementById('search-term');
const searchTypeInput = document.getElementById('search-type'); // Hidden input para o valor real
const searchTypeDisplayInput = document.getElementById('search-type-display'); // Input de display para o MDL selectfield
const searchButtonIcon = document.getElementById('search-button-icon'); // Botão de ícone da busca (ID corrigido)
const mainSearchButton = document.getElementById('main-search-button'); // Botão "Buscar" principal
const clearSearchButton = document.getElementById('clear-search-button'); // Botão "Limpar Filtros"
const scholarSearchBox = document.getElementById('scholar-search-box'); // A caixa de busca Google Scholar-like

// Novos elementos de filtro
const filterLanguageSelect = document.getElementById('filter-language');
const filterArticleTypeSelect = document.getElementById('filter-article-type');

// --- Funções Auxiliares ---

// Função para exibir mensagens de erro
function displayError(message) {
    errorDisplay.textContent = `Erro: ${message}`;
    errorDisplay.style.display = 'block';
    if (loadingMessage) loadingMessage.style.display = 'none'; // Oculta mensagem de carregamento
    articlesListDiv.innerHTML = ''; // Limpa os artigos existentes
}

// Função para formatar o timestamp do Firestore
function formatTimestamp(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Data Indisponível';
    const date = timestamp.toDate();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('pt-BR', options);
}

// --- Função Principal de Carregamento e Exibição de Artigos ---

async function loadArticles() {
    articlesListDiv.innerHTML = `<p class="loading-message">Carregando artigos...</p>`;
    errorDisplay.style.display = 'none'; // Oculta qualquer erro anterior

    const searchTerm = searchTermInput.value.toLowerCase().trim();
    // Usa o valor do input hidden para o tipo de busca
    const searchField = searchTypeInput.value;
    const languageFilter = filterLanguageSelect.value;
    const articleTypeFilter = filterArticleTypeSelect.value;

    try {
        let articlesRef = firestore.collection('articlesdoc');

        // Aplica os filtros 'where'
        if (searchTerm && searchField) {
            // Firestore não faz busca de texto completo. Isso é uma "startsWith"
            articlesRef = articlesRef
                .where(searchField, '>=', searchTerm)
                .where(searchField, '<=', searchTerm + '\uf8ff');
        }
        if (languageFilter) {
            articlesRef = articlesRef.where('language', '==', languageFilter);
        }
        if (articleTypeFilter) {
            articlesRef = articlesRef.where('articleType', '==', articleTypeFilter);
        }

        // Ordena os resultados
        // Se você tiver múltiplos .where() e o .orderBy() em campos diferentes,
        // o Firestore exigirá um índice composto. Verifique o console do Firebase.
        if (searchTerm && searchField) {
            // Se houver termo de busca, ordene pelo campo de busca
            articlesRef = articlesRef.orderBy(searchField);
        } else {
            // Caso contrário, ordene pela data de criação
            articlesRef = articlesRef.orderBy('timestamp', 'desc');
        }

        const snapshot = await articlesRef.get();

        articlesListDiv.innerHTML = ''; // Limpa a mensagem de carregamento/vazio

        if (snapshot.empty) {
            const emptyMessage = (searchTerm || languageFilter || articleTypeFilter) ?
                `Nenhum artigo encontrado com os critérios de busca.` :
                'Use a barra de pesquisa e/ou os filtros acima para encontrar artigos.';
            articlesListDiv.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            const title = data.title || 'Título Indisponível';
            const userId = data.userId || 'ID do Usuário Indisponível';
            const summary = data.summary || 'Nenhum resumo disponível.';
            const introduction = data.introduction || 'Nenhuma introdução disponível.';
            const description = data.description || 'Nenhuma descrição disponível.';
            const discussion = data.discussion || 'Nenhuma discussão disponível.';
            const methodology = data.methodology || 'Nenhuma metodologia disponível.';
            const abstract = data.abstract || 'Nenhum abstract disponível.';
            const conclusion = data.conclusion || 'Nenhuma conclusão disponível.';
            const sources = (data.sources && Array.isArray(data.sources)) ? data.sources.join(', ') : 'Nenhuma fonte disponível.';
            const language = data.language || 'Não especificado';
            const articleType = data.articleType || 'Não especificado';

            const formattedTimestamp = formatTimestamp(data.timestamp);
            const formattedLastModified = formatTimestamp(data.lastModified);

            const card = document.createElement('div');
            card.className = 'article-card mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-cell--12-col-phone';
            card.innerHTML = `
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">${title}</h2>
                </div>
                <div class="mdl-card__supporting-text">
                    <strong>ID do Usuário:</strong> <p>${userId}</p>
                    <strong>Idioma:</strong> <p>${language}</p>
                    <strong>Tipo de Artigo:</strong> <p>${articleType}</p>
                    <strong>Resumo:</strong> <p>${summary}</p>
                    <strong>Introdução:</strong> <p>${introduction}</p>
                    <strong>Descrição:</strong> <p>${description}</p>
                    <strong>Discussão:</strong> <p>${discussion}</p>
                    <strong>Metodologia:</strong> <p>${methodology}</p>
                    <strong>Abstract:</strong> <p>${abstract}</p>
                    <strong>Conclusão:</strong> <p>${conclusion}</p>
                    <strong>Fontes:</strong> <p>${sources}</p>
                    <strong>Última Modificação:</strong> <p>${formattedLastModified}</p>
                    <strong>Data de Criação:</strong> <p>${formattedTimestamp}</p>
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <a href="#" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect edit-article-button" data-article-id="${id}">Editar</a>
                    <button class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect delete-article-button" data-article-id="${id}">Excluir</button>
                </div>
            `;
            articlesListDiv.appendChild(card);
        });

        // Atualiza os componentes MDL para elementos criados dinamicamente
        if (window.componentHandler) {
            window.componentHandler.upgradeElements(articlesListDiv);
        }

    } catch (error) {
        displayError(`Não foi possível carregar os artigos. ${error.message}`);
        console.error("Erro ao carregar artigos:", error);
        if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
            console.warn("Possível erro de falta de índice no Firestore. Crie um índice composto se estiver usando múltiplos 'where' clauses ou 'where' com 'orderBy' em campos diferentes. O link para criar o índice aparecerá no console do Firebase.");
        }
    }
}

// --- Funções de Ação (Excluir) ---

async function deleteArticle(articleId) {
    if (!confirm('Tem certeza que deseja excluir este artigo? Esta ação é irreversível.')) return;

    try {
        await firestore.collection('articlesdoc').doc(articleId).delete();
        alert('Artigo excluído com sucesso!');
        // Recarrega os artigos com os filtros atuais
        loadArticles(); // Chama loadArticles sem argumentos para usar os valores atuais dos inputs
    } catch (error) {
        displayError(`Não foi possível excluir o artigo. ${error.message}`);
    }
}

// --- Event Listeners e Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    // Atualiza o DOM para os componentes MDL
    if (window.componentHandler) {
        window.componentHandler.upgradeDom();
    }

    // Lógica para o selectfield de "Buscar por" (dropdown personalizado do MDL)
    const searchTypeMenuItems = document.querySelectorAll('.mdl-menu__item');
    searchTypeMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedValue = item.getAttribute('data-val');
            const selectedText = item.textContent;

            // Atualiza o input hidden e o input de display
            searchTypeInput.value = selectedValue;
            searchTypeDisplayInput.value = selectedText;

            // Encontra o elemento pai do MaterialTextfield para o selectfield de busca
            const searchTypeMdlSelectfield = searchTypeDisplayInput.closest('.mdl-textfield');
            if (searchTypeMdlSelectfield && searchTypeMdlSelectfield.MaterialTextfield) {
                // Sincroniza o display visual do MDL com o novo texto
                searchTypeMdlSelectfield.MaterialTextfield.change(selectedText);
                searchTypeMdlSelectfield.MaterialTextfield.checkDirty();
            }
        });
    });

    // Delegar eventos de clique para os botões de editar/excluir no container de artigos
    articlesListDiv.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('delete-article-button')) {
            deleteArticle(target.dataset.articleId);
        }
        if (target.classList.contains('edit-article-button')) {
            event.preventDefault();
            const urlToLoad = `./admintools/editordeartigos.html?id=${target.dataset.articleId}`;
            // Esta lógica é para se você estiver usando iframes ou navegação de página
            if (window.parent !== window && window.parent.postMessage) {
                window.parent.postMessage({ type: 'navigateIframe', url: urlToLoad }, window.location.origin);
            } else {
                window.location.href = urlToLoad;
            }
        }
    });

    // Função centralizada para executar a busca completa com todos os filtros
    const performSearch = () => {
        loadArticles(); // loadArticles já lê os valores dos inputs/selects
    };

    // Event listener para o botão de busca dentro da caixa (ícone)
    if (searchButtonIcon) { // Adiciona verificação de existência para evitar erro null
        searchButtonIcon.addEventListener('click', performSearch);
    } else {
        console.warn("Elemento com ID 'search-button-icon' não encontrado. O botão de busca por ícone não funcionará.");
    }

    // Event listener para o novo botão principal de busca
    if (mainSearchButton) { // Adiciona verificação de existência
        mainSearchButton.addEventListener('click', performSearch);
    } else {
        console.warn("Elemento com ID 'main-search-button' não encontrado.");
    }

    // Event listeners para os filtros de idioma e tipo de artigo (acionam a busca ao mudar)
    if (filterLanguageSelect) {
        filterLanguageSelect.addEventListener('change', () => {
            // Atualiza o display visual do MDL para o select de idioma
            const parentElement = filterLanguageSelect.closest('.mdl-textfield');
            if (parentElement && parentElement.MaterialTextfield) {
                parentElement.MaterialTextfield.change(filterLanguageSelect.options[filterLanguageSelect.selectedIndex].text);
                parentElement.MaterialTextfield.checkDirty();
            }
            performSearch();
        });
    }

    if (filterArticleTypeSelect) {
        filterArticleTypeSelect.addEventListener('change', () => {
            // Atualiza o display visual do MDL para o select de tipo de artigo
            const parentElement = filterArticleTypeSelect.closest('.mdl-textfield');
            if (parentElement && parentElement.MaterialTextfield) {
                parentElement.MaterialTextfield.change(filterArticleTypeSelect.options[filterArticleTypeSelect.selectedIndex].text);
                parentElement.MaterialTextfield.checkDirty();
            }
            performSearch();
        });
    }

    // Evento para recarregar artigos ao pressionar Enter no campo de busca
    if (searchTermInput) {
        searchTermInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita o envio de formulário padrão
                performSearch();
            }
        });
    }

    // Evento para o botão de limpar busca
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            // Limpa os valores dos inputs e selects
            searchTermInput.value = '';
            searchTypeInput.value = 'title'; // Define o valor padrão para o hidden input
            searchTypeDisplayInput.value = 'Título'; // Define o texto padrão para o display

            filterLanguageSelect.value = ''; // Limpa o filtro de idioma
            filterArticleTypeSelect.value = ''; // Limpa o filtro de tipo de artigo

            // Atualiza o MDL para os campos de texto
            if (searchTermInput.parentElement && searchTermInput.parentElement.MaterialTextfield) {
                searchTermInput.parentElement.MaterialTextfield.checkDirty();
            }

            // Atualiza o MDL para o selectfield de tipo de busca
            const searchTypeMdlSelectfield = searchTypeDisplayInput.closest('.mdl-textfield');
            if (searchTypeMdlSelectfield && searchTypeMdlSelectfield.MaterialTextfield) {
                searchTypeMdlSelectfield.MaterialTextfield.change('Título'); // Define o texto padrão
                searchTypeMdlSelectfield.MaterialTextfield.checkDirty();
            }

            // Atualiza o MDL para os selectfields de filtro
            const languageParent = filterLanguageSelect.closest('.mdl-textfield');
            if (languageParent && languageParent.MaterialTextfield) {
                languageParent.MaterialTextfield.change(''); // Define o texto como vazio para 'Todos os Idiomas'
                languageParent.MaterialTextfield.checkDirty();
            }

            const articleTypeParent = filterArticleTypeSelect.closest('.mdl-textfield');
            if (articleTypeParent && articleTypeParent.MaterialTextfield) {
                articleTypeParent.MaterialTextfield.change(''); // Define o texto como vazio para 'Todos os Tipos'
                articleTypeParent.MaterialTextfield.checkDirty();
            }

            // Carrega os artigos com os filtros limpos
            loadArticles();
        });
    }

    // Adiciona classes para estado de foco na caixa de busca estilo Scholar
    if (searchTermInput && scholarSearchBox) {
        searchTermInput.addEventListener('focus', () => {
            scholarSearchBox.classList.add('is-focused');
        });

        searchTermInput.addEventListener('blur', () => {
            scholarSearchBox.classList.remove('is-focused');
        });
    }

    // Lógica para preencher o display inicial do select de busca e dos filtros
    // Importante chamar checkDirty para que o label flutue se houver um valor inicial
    const initialSearchTypeMdlSelectfield = searchTypeDisplayInput.closest('.mdl-textfield');
    if (initialSearchTypeMdlSelectfield && initialSearchTypeMdlSelectfield.MaterialTextfield) {
        initialSearchTypeMdlSelectfield.MaterialTextfield.change(searchTypeDisplayInput.value);
        initialSearchTypeMdlSelectfield.MaterialTextfield.checkDirty();
    }

    const initialLanguageMdlSelectfield = filterLanguageSelect.closest('.mdl-textfield');
    if (initialLanguageMdlSelectfield && initialLanguageMdlSelectfield.MaterialTextfield) {
        initialLanguageMdlSelectfield.MaterialTextfield.change(filterLanguageSelect.options[filterLanguageSelect.selectedIndex].text);
        initialLanguageMdlSelectfield.MaterialTextfield.checkDirty();
    }

    const initialArticleTypeMdlSelectfield = filterArticleTypeSelect.closest('.mdl-textfield');
    if (initialArticleTypeMdlSelectfield && initialArticleTypeMdlSelectfield.MaterialTextfield) {
        initialArticleTypeMdlSelectfield.MaterialTextfield.change(filterArticleTypeSelect.options[filterArticleTypeSelect.selectedIndex].text);
        initialArticleTypeMdlSelectfield.MaterialTextfield.checkDirty();
    }

    // Carrega os artigos iniciais (sem filtros) ao carregar a página
    loadArticles();
});
