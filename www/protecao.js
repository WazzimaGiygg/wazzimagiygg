// protecao.js
(function() {
    console.log('Script de Proteção carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Alterar Proteção do Artigo';
    
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Selecione o artigo:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Nível de proteção:</label>
            <select id="protectionLevel" class="form-input">
                <option value="none">Nenhuma (todos podem editar)</option>
                <option value="autoconfirmed">Usuários autoconfirmados</option>
                <option value="sysop">Apenas administradores</option>
                <option value="full">Proteção total (ninguém pode editar)</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Duração da proteção:</label>
            <select id="protectionDuration" class="form-input">
                <option value="temporary">Temporária</option>
                <option value="indefinite">Indefinida</option>
                <option value="permanent">Permanente</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Motivo da proteção:</label>
            <textarea id="protectionReason" class="form-input form-textarea" placeholder="Explique o motivo da proteção..."></textarea>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="applyProtection()" id="protectBtn">
                <i class="fas fa-shield-alt"></i> Aplicar Proteção
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
    
    // Função para aplicar proteção
    window.applyProtection = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const protectionLevel = document.getElementById('protectionLevel').value;
        const protectionDuration = document.getElementById('protectionDuration').value;
        const protectionReason = document.getElementById('protectionReason').value.trim();
        const protectBtn = document.getElementById('protectBtn');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        if (!protectionReason) {
            wikiNotPedia.showError('Explique o motivo da proteção!');
            return;
        }
        
        protectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aplicando...';
        protectBtn.disabled = true;
        
        try {
            // Buscar artigo atual
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const articleData = articleDoc.data();
            
            if (!articleData) {
                throw new Error('Artigo não encontrado');
            }
            
            // Atualizar artigo com informações de proteção
            await wikiNotPedia.db.collection('wnpx').doc(articleId).update({
                protection: {
                    level: protectionLevel,
                    duration: protectionDuration,
                    reason: protectionReason,
                    protectedBy: wikiNotPedia.currentUser?.uid || 'anonymous',
                    protectedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp()
                },
                updatedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp()
            });
            
            wikiNotPedia.showSuccess('Proteção aplicada com sucesso!');
            
            // Recarregar artigos na página principal
            wikiNotPedia.loadArticles();
            
            // Fechar área de ação
            wikiNotPedia.closeActionArea();
            
        } catch (error) {
            console.error('Erro ao aplicar proteção:', error);
            wikiNotPedia.showError('Erro ao aplicar proteção. Tente novamente.');
        } finally {
            protectBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Aplicar Proteção';
            protectBtn.disabled = false;
        }
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
