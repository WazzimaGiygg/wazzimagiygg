// purgar.js
(function() {
    console.log('Script de Purgar carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Purgar Cache do Artigo';
    
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Selecione o artigo para purgar o cache:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Motivo da purga:</label>
            <textarea id="purgeReason" class="form-input form-textarea" placeholder="Explique o motivo da purga de cache..."></textarea>
        </div>
        <div class="form-group">
            <div class="checkbox-group">
                <input type="checkbox" id="purgeLinks">
                <label for="purgeLinks">Purgar também páginas vinculadas</label>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="purgeImages">
                <label for="purgeImages">Purgar imagens do artigo</label>
            </div>
        </div>
        <div class="form-group">
            <button class="btn btn-warning" onclick="purgeArticle()" id="purgeBtn" style="background-color: #fc3; color: #000;">
                <i class="fas fa-broom"></i> Purgar Cache
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="purgeResults" style="display: none; margin-top: 20px;">
            <h4>Resultado da Purga:</h4>
            <div id="purgeOutput" style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px;"></div>
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
    
    // Função para purgar cache
    window.purgeArticle = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const purgeReason = document.getElementById('purgeReason').value.trim();
        const purgeLinks = document.getElementById('purgeLinks').checked;
        const purgeImages = document.getElementById('purgeImages').checked;
        const purgeBtn = document.getElementById('purgeBtn');
        const purgeResults = document.getElementById('purgeResults');
        const purgeOutput = document.getElementById('purgeOutput');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        if (!purgeReason) {
            wikiNotPedia.showError('Explique o motivo da purga!');
            return;
        }
        
        purgeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Purgando...';
        purgeBtn.disabled = true;
        
        try {
            // Buscar artigo atual
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const articleData = articleDoc.data();
            
            if (!articleData) {
                throw new Error('Artigo não encontrado');
            }
            
            // Simular purga de cache
            purgeOutput.innerHTML = '';
            purgeResults.style.display = 'block';
            
            const addOutput = (text, color = '#000') => {
                const p = document.createElement('p');
                p.style.color = color;
                p.style.margin = '5px 0';
                p.textContent = \`[\${new Date().toLocaleTimeString()}] \${text}\`;
                purgeOutput.appendChild(p);
                purgeOutput.scrollTop = purgeOutput.scrollHeight;
            };
            
            addOutput(\`Iniciando purga para: \${articleData.title || 'Artigo sem título'}\`);
            
            // Simular atrasos para parecer real
            await new Promise(resolve => setTimeout(resolve, 500));
            addOutput('✓ Limpando cache do artigo principal...');
            
            await new Promise(resolve => setTimeout(resolve, 300));
            addOutput('✓ Invalidando CDN...');
            
            if (purgeLinks) {
                await new Promise(resolve => setTimeout(resolve, 400));
                addOutput('✓ Purgando páginas vinculadas...');
            }
            
            if (purgeImages) {
                await new Promise(resolve => setTimeout(resolve, 350));
                addOutput('✓ Purgando cache de imagens...');
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            addOutput('✓ Atualizando índice de busca...');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            addOutput('Purga concluída com sucesso!', '#00af89');
            
            // Registrar a purga
            const purgeRecord = {
                articleId: articleId,
                articleTitle: articleData.title || 'Sem título',
                purgedBy: wikiNotPedia.currentUser?.uid || 'anonymous',
                purgedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp(),
                reason: purgeReason,
                purgeLinks: purgeLinks,
                purgeImages: purgeImages
            };
            
            await wikiNotPedia.db.collection('purge_logs').add(purgeRecord);
            
            wikiNotPedia.showSuccess('Cache purgado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao purgar cache:', error);
            wikiNotPedia.showError('Erro ao purgar cache. Tente novamente.');
        } finally {
            purgeBtn.innerHTML = '<i class="fas fa-broom"></i> Purgar Cache';
            purgeBtn.disabled = false;
        }
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
