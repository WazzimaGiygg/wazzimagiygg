// mover.js
(function() {
    console.log('Script de Mover Artigo carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Mover Artigo';
    
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Artigo para mover:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Novo nome/título:</label>
            <input type="text" id="newTitle" class="form-input" placeholder="Digite o novo título do artigo">
        </div>
        <div class="form-group">
            <label class="form-label">Motivo da movimentação:</label>
            <textarea id="moveReason" class="form-input form-textarea" placeholder="Explique o motivo da movimentação..."></textarea>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="moveArticle()" id="moveBtn">
                <i class="fas fa-arrows-alt"></i> Mover Artigo
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
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
    
    // Função para mover artigo
    window.moveArticle = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const newTitle = document.getElementById('newTitle').value.trim();
        const moveReason = document.getElementById('moveReason').value.trim();
        const moveBtn = document.getElementById('moveBtn');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        if (!newTitle) {
            wikiNotPedia.showError('Digite o novo título do artigo!');
            return;
        }
        
        if (!moveReason) {
            wikiNotPedia.showError('Explique o motivo da movimentação!');
            return;
        }
        
        moveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Movendo...';
        moveBtn.disabled = true;
        
        try {
            // Buscar artigo atual
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const articleData = articleDoc.data();
            
            if (!articleData) {
                throw new Error('Artigo não encontrado');
            }
            
            // Criar novo artigo com novo título
            const newArticleData = {
                ...articleData,
                title: newTitle,
                movedFrom: articleData.title,
                movedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp(),
                movedBy: wikiNotPedia.currentUser?.uid || 'anonymous',
                moveReason: moveReason
            };
            
            // Criar novo documento com o novo título
            await wikiNotPedia.db.collection('wnpx').add(newArticleData);
            
            // Remover artigo antigo
            await wikiNotPedia.db.collection('wnpx').doc(articleId).delete();
            
            wikiNotPedia.showSuccess('Artigo movido com sucesso!');
            
            // Recarregar artigos na página principal
            wikiNotPedia.loadArticles();
            
            // Fechar área de ação
            wikiNotPedia.closeActionArea();
            
        } catch (error) {
            console.error('Erro ao mover artigo:', error);
            wikiNotPedia.showError('Erro ao mover artigo. Tente novamente.');
        } finally {
            moveBtn.innerHTML = '<i class="fas fa-arrows-alt"></i> Mover Artigo';
            moveBtn.disabled = false;
        }
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
