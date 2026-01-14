// mudancas_relacionadas.js
(function() {
    console.log('Script de Mudanças Relacionadas carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Mudanças Relacionadas';
    
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Selecione um artigo para ver mudanças relacionadas:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Período:</label>
            <select id="timePeriod" class="form-input">
                <option value="1">Últimas 24 horas</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="all">Todo o período</option>
            </select>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="loadRelatedChanges()" id="loadBtn">
                <i class="fas fa-history"></i> Carregar Mudanças
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="results" style="margin-top: 20px; display: none;">
            <h4>Mudanças Relacionadas:</h4>
            <div id="changesList" class="sidebar-menu"></div>
        </div>
    `;
    
    // Carregar artigos disponíveis
    async function loadArticles() {
        try {
            const querySnapshot = await wikiNotPedia.db.collection('wnpx')
                .orderBy('title')
                .limit(50)
                .get();
            
            const select = document.getElementById('articleSelect');
            select.innerHTML = '<option value="">Selecione um artigo</option>';
            
            querySnapshot.forEach((doc) => {
                const article = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = wikiNotPedia.escapeHtml(article.title || 'Sem título');
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar artigos:', error);
            actionBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar artigos</h3>
                    <p>Não foi possível carregar a lista de artigos.</p>
                </div>
            `;
        }
    }
    
    // Função para carregar mudanças relacionadas
    window.loadRelatedChanges = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const timePeriod = document.getElementById('timePeriod').value;
        const results = document.getElementById('results');
        const list = document.getElementById('changesList');
        const loadBtn = document.getElementById('loadBtn');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        loadBtn.disabled = true;
        
        try {
            list.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Buscando mudanças...</div>';
            results.style.display = 'block';
            
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const articleTitle = articleDoc.data()?.title || '';
            const articleDescription = articleDoc.data()?.description || '';
            
            // Buscar todos os artigos
            const allArticlesSnapshot = await wikiNotPedia.db.collection('wnpx')
                .orderBy('updatedAt', 'desc')
                .limit(100)
                .get();
            
            list.innerHTML = '';
            
            let foundChanges = 0;
            const now = new Date();
            const timeAgo = new Date(now.getTime() - (timePeriod * 24 * 60 * 60 * 1000));
            
            allArticlesSnapshot.forEach((doc) => {
                const article = doc.data();
                if (doc.id === articleId) return;
                
                // Verificar se o artigo foi atualizado no período selecionado
                let updatedAt = article.updatedAt;
                if (updatedAt) {
                    updatedAt = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt);
                    
                    if (timePeriod !== 'all' && updatedAt < timeAgo) {
                        return;
                    }
                }
                
                // Verificar se o artigo está relacionado (compartilha palavras-chave)
                const currentKeywords = extractKeywords(articleTitle + ' ' + articleDescription);
                const otherKeywords = extractKeywords(article.title + ' ' + article.description);
                
                const commonKeywords = currentKeywords.filter(keyword => 
                    otherKeywords.includes(keyword)
                );
                
                if (commonKeywords.length > 0) {
                    const div = document.createElement('div');
                    div.style.padding = '10px';
                    div.style.borderBottom = '1px solid #eee';
                    
                    const dateStr = updatedAt ? updatedAt.toLocaleDateString('pt-BR') : 'Data desconhecida';
                    
                    div.innerHTML = \`
                        <i class="fas fa-edit"></i> 
                        <strong>\${wikiNotPedia.escapeHtml(article.title || 'Sem título')}</strong>
                        <span style="float: right; color: #666; font-size: 12px;">\${dateStr}</span>
                        <p style="margin: 5px 0 0 20px; font-size: 14px; color: #666;">
                            <strong>Palavras-chave em comum:</strong> \${commonKeywords.join(', ')}
                        </p>
                    \`;
                    list.appendChild(div);
                    foundChanges++;
                }
            });
            
            if (foundChanges === 0) {
                list.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Nenhuma mudança relacionada encontrada no período selecionado.</div>';
            }
            
        } catch (error) {
            console.error('Erro ao buscar mudanças relacionadas:', error);
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: #d33;">Erro ao carregar mudanças relacionadas.</div>';
        } finally {
            loadBtn.innerHTML = '<i class="fas fa-history"></i> Carregar Mudanças';
            loadBtn.disabled = false;
        }
    };
    
    // Função para extrair palavras-chave
    function extractKeywords(text) {
        const commonWords = ['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 
                           'por', 'para', 'com', 'sem', 'que', 'é', 'são', 'como', 'mas', 'se', 'não', 'ou'];
        
        return text.toLowerCase()
            .split(/[^a-záàâãéèêíïóôõöúçñ]+/)
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 10); // Limitar a 10 palavras-chave
    }
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
