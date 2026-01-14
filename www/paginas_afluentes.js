// paginas_afluentes.js
(function() {
    console.log('Script de Páginas Afluentes carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Páginas Afluentes';
    
    // Interface para buscar páginas afluentes
    actionBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Selecione uma página para ver suas páginas afluentes:</label>
            <select id="pageSelect" class="form-input">
                <option value="">Carregando páginas...</option>
            </select>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="loadAffiliatedPages()" id="loadBtn">
                <i class="fas fa-search"></i> Buscar Páginas Afluentes
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="results" style="margin-top: 20px; display: none;">
            <h4>Páginas Afluentes:</h4>
            <div id="affiliatedList" class="sidebar-menu"></div>
        </div>
    `;
    
    // Carregar páginas disponíveis
    async function loadPages() {
        try {
            const querySnapshot = await wikiNotPedia.db.collection('wnpx')
                .orderBy('title')
                .limit(50)
                .get();
            
            const select = document.getElementById('pageSelect');
            select.innerHTML = '<option value="">Selecione uma página</option>';
            
            querySnapshot.forEach((doc) => {
                const article = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = wikiNotPedia.escapeHtml(article.title || 'Sem título');
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar páginas:', error);
            actionBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar páginas</h3>
                    <p>Não foi possível carregar a lista de páginas.</p>
                </div>
            `;
        }
    }
    
    // Função para carregar páginas afluentes
    window.loadAffiliatedPages = async function() {
        const pageId = document.getElementById('pageSelect').value;
        const results = document.getElementById('results');
        const list = document.getElementById('affiliatedList');
        const loadBtn = document.getElementById('loadBtn');
        
        if (!pageId) {
            wikiNotPedia.showError('Selecione uma página primeiro!');
            return;
        }
        
        loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        loadBtn.disabled = true;
        
        try {
            list.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Buscando páginas afluentes...</div>';
            results.style.display = 'block';
            
            const currentPageDoc = await wikiNotPedia.db.collection('wnpx').doc(pageId).get();
            const currentPageTitle = currentPageDoc.data()?.title || '';
            
            const allPagesSnapshot = await wikiNotPedia.db.collection('wnpx')
                .where('description', '>=', '')
                .get();
            
            list.innerHTML = '';
            
            let foundPages = 0;
            
            allPagesSnapshot.forEach((doc) => {
                const article = doc.data();
                if (doc.id !== pageId && article.description && 
                    article.description.toLowerCase().includes(currentPageTitle.toLowerCase())) {
                    const div = document.createElement('div');
                    div.style.padding = '10px';
                    div.style.borderBottom = '1px solid #eee';
                    div.innerHTML = `
                        <i class="fas fa-file-alt"></i> 
                        <strong>\${wikiNotPedia.escapeHtml(article.title || 'Sem título')}</strong>
                        <p style="margin: 5px 0 0 20px; font-size: 14px; color: #666;">
                            \${wikiNotPedia.escapeHtml(article.description.substring(0, 100) + '...')}
                        </p>
                    `;
                    list.appendChild(div);
                    foundPages++;
                }
            });
            
            if (foundPages === 0) {
                list.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Nenhuma página afluente encontrada.</div>';
            }
            
        } catch (error) {
            console.error('Erro ao buscar páginas afluentes:', error);
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: #d33;">Erro ao carregar páginas afluentes.</div>';
        } finally {
            loadBtn.innerHTML = '<i class="fas fa-search"></i> Buscar Páginas Afluentes';
            loadBtn.disabled = false;
        }
    };
    
    // Carregar páginas ao iniciar
    setTimeout(loadPages, 100);
})();
