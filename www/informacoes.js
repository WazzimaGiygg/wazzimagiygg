// informacoes.js
(function() {
    console.log('Script de Informações da Página carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Informações da Página';
    
    actionBody.innerHTML = \`
        <div class="form-group">
            <label class="form-label">Selecione o artigo para ver informações:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="loadPageInfo()" id="infoBtn">
                <i class="fas fa-info-circle"></i> Carregar Informações
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="infoResult" style="display: none; margin-top: 20px;">
            <h4>Informações da Página:</h4>
            <div id="pageInfo" style="background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #ddd;"></div>
        </div>
    \`;
    
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
            actionBody.innerHTML = \`
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar artigos</h3>
                    <p>Não foi possível carregar a lista de artigos.</p>
                </div>
            \`;
        }
    }
    
    // Função para carregar informações da página
    window.loadPageInfo = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const infoBtn = document.getElementById('infoBtn');
        const infoResult = document.getElementById('infoResult');
        const pageInfo = document.getElementById('pageInfo');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        infoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        infoBtn.disabled = true;
        
        try {
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const article = articleDoc.data();
            
            if (!article) {
                throw new Error('Artigo não encontrado');
            }
            
            // Calcular estatísticas
            const wordCount = article.description ? article.description.split(/\s+/).length : 0;
            const charCount = article.description ? article.description.length : 0;
            const createdAt = article.createdAt ? 
                article.createdAt.toDate().toLocaleString('pt-BR') : 
                'Data desconhecida';
            const updatedAt = article.updatedAt ? 
                article.updatedAt.toDate().toLocaleString('pt-BR') : 
                'Data desconhecida';
            
            // Gerar HTML com informações
            let infoHTML = \`
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <h5 style="margin: 0 0 10px 0; color: #3366cc;">Informações Básicas</h5>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold; width: 150px;">Título:</td>
                                <td style="padding: 5px 0;">\${wikiNotPedia.escapeHtml(article.title || 'Sem título')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Autor:</td>
                                <td style="padding: 5px 0;">\${wikiNotPedia.escapeHtml(article.author || 'Desconhecido')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Criado em:</td>
                                <td style="padding: 5px 0;">\${createdAt}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Atualizado em:</td>
                                <td style="padding: 5px 0;">\${updatedAt}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div>
                        <h5 style="margin: 0 0 10px 0; color: #3366cc;">Estatísticas</h5>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Palavras:</td>
                                <td style="padding: 5px 0;">\${wordCount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Caracteres:</td>
                                <td style="padding: 5px 0;">\${charCount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">Visualizações:</td>
                                <td style="padding: 5px 0;">\${article.views || 0}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-weight: bold;">ID do Artigo:</td>
                                <td style="padding: 5px 0; font-family: monospace; font-size: 12px;">\${articleId}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            \`;
            
            // Adicionar proteção se existir
            if (article.protection) {
                infoHTML += \`
                    <div style="margin-top: 20px; padding: 15px; background: #fff5f5; border-radius: 5px; border-left: 4px solid #d33;">
                        <h5 style="margin: 0 0 10px 0; color: #d33;">Proteção</h5>
                        <p style="margin: 5px 0;">
                            <strong>Nível:</strong> \${article.protection.level}<br>
                            <strong>Motivo:</strong> \${article.protection.reason}<br>
                            <strong>Protegido por:</strong> \${article.protection.protectedBy}<br>
                            <strong>Data:</strong> \${article.protection.protectedAt ? article.protection.protectedAt.toDate().toLocaleString('pt-BR') : 'N/A'}
                        </p>
                    </div>
                \`;
            }
            
            // Adicionar histórico de movimentação se existir
            if (article.movedFrom) {
                infoHTML += \`
                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #4CAF50;">
                        <h5 style="margin: 0 0 10px 0; color: #2e7d32;">Histórico de Movimentação</h5>
                        <p style="margin: 5px 0;">
                            <strong>Movido de:</strong> \${wikiNotPedia.escapeHtml(article.movedFrom)}<br>
                            <strong>Motivo:</strong> \${wikiNotPedia.escapeHtml(article.moveReason || 'N/A')}<br>
                            <strong>Data:</strong> \${article.movedAt ? article.movedAt.toDate().toLocaleString('pt-BR') : 'N/A'}
                        </p>
                    </div>
                \`;
            }
            
            pageInfo.innerHTML = infoHTML;
            infoResult.style.display = 'block';
            
            // Rolar para o resultado
            infoResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Erro ao carregar informações:', error);
            wikiNotPedia.showError('Erro ao carregar informações da página.');
        } finally {
            infoBtn.innerHTML = '<i class="fas fa-info-circle"></i> Carregar Informações';
            infoBtn.disabled = false;
        }
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
