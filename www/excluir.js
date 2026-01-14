// excluir.js
(function() {
    console.log('Script de Exclusão carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Excluir Artigo';
    
    // Interface para exclusão
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Selecione o artigo para excluir:</label>
            <select id="deleteSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Motivo da exclusão:</label>
            <select id="reasonSelect" class="form-input">
                <option value="spam">Spam ou propaganda</option>
                <option value="vandalism">Vandalismo</option>
                <option value="copyright">Violação de direitos autorais</option>
                <option value="duplicate">Conteúdo duplicado</option>
                <option value="other">Outro motivo</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Explicação adicional:</label>
            <textarea id="explanation" class="form-input form-textarea" placeholder="Explique o motivo da exclusão..."></textarea>
        </div>
        <div class="form-group">
            <button class="btn btn-danger" onclick="confirmDelete()" id="deleteBtn">
                <i class="fas fa-trash"></i> Excluir Artigo
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
            
            const select = document.getElementById('deleteSelect');
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
    
    // Função para confirmar exclusão
    window.confirmDelete = async function() {
        const articleId = document.getElementById('deleteSelect').value;
        const reason = document.getElementById('reasonSelect').value;
        const explanation = document.getElementById('explanation').value;
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        if (!explanation.trim() && reason === 'other') {
            wikiNotPedia.showError('Por favor, explique o motivo da exclusão.');
            return;
        }
        
        const confirmDelete = confirm('Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.');
        
        if (!confirmDelete) return;
        
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
        deleteBtn.disabled = true;
        
        try {
            // Buscar informações do artigo
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const articleTitle = articleDoc.data()?.title || 'Artigo sem título';
            
            // Registrar a exclusão
            const deletionRecord = {
                articleId: articleId,
                articleTitle: articleTitle,
                deletedBy: wikiNotPedia.currentUser?.uid || 'anonymous',
                deletedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp(),
                reason: reason,
                explanation: explanation
            };
            
            // Salvar registro de exclusão
            await wikiNotPedia.db.collection('deletion_logs').add(deletionRecord);
            
            // Excluir o artigo
            await wikiNotPedia.db.collection('wnpx').doc(articleId).delete();
            
            wikiNotPedia.showSuccess('Artigo excluído com sucesso!');
            
            // Recarregar artigos na página principal
            wikiNotPedia.loadArticles();
            
            // Fechar área de ação
            wikiNotPedia.closeActionArea();
            
        } catch (error) {
            console.error('Erro ao excluir artigo:', error);
            wikiNotPedia.showError('Erro ao excluir artigo. Tente novamente.');
        } finally {
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir Artigo';
            deleteBtn.disabled = false;
        }
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
