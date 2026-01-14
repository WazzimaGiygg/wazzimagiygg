// imprimir.js
(function() {
    console.log('Script de Imprimir carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Versão para Impressão';
    
    actionBody.innerHTML = \`
        <div class="form-group">
            <label class="form-label">Selecione o artigo para gerar versão impressa:</label>
            <select id="articleSelect" class="form-input">
                <option value="">Carregando artigos...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Opções de impressão:</label>
            <div class="checkbox-group">
                <input type="checkbox" id="printHeader" checked>
                <label for="printHeader">Incluir cabeçalho com título e data</label>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="printFooter" checked>
                <label for="printFooter">Incluir rodapé com informações da wiki</label>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="printPageNumbers">
                <label for="printPageNumbers">Incluir numeração de páginas</label>
            </div>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="generatePrintVersion()" id="printBtn">
                <i class="fas fa-print"></i> Gerar Versão para Impressão
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="printPreview" style="display: none; margin-top: 20px;">
            <h4>Pré-visualização:</h4>
            <div id="previewContent" style="background: white; border: 1px solid #ccc; padding: 20px; max-height: 400px; overflow-y: auto; font-family: 'Times New Roman', serif;"></div>
            <div style="margin-top: 10px;">
                <button class="btn btn-success" onclick="printDocument()" id="printDocBtn">
                    <i class="fas fa-print"></i> Imprimir Documento
                </button>
            </div>
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
    
    // Função para gerar versão para impressão
    window.generatePrintVersion = async function() {
        const articleId = document.getElementById('articleSelect').value;
        const printHeader = document.getElementById('printHeader').checked;
        const printFooter = document.getElementById('printFooter').checked;
        const printPageNumbers = document.getElementById('printPageNumbers').checked;
        const printBtn = document.getElementById('printBtn');
        const printPreview = document.getElementById('printPreview');
        const previewContent = document.getElementById('previewContent');
        
        if (!articleId) {
            wikiNotPedia.showError('Selecione um artigo primeiro!');
            return;
        }
        
        printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
        printBtn.disabled = true;
        
        try {
            const articleDoc = await wikiNotPedia.db.collection('wnpx').doc(articleId).get();
            const article = articleDoc.data();
            
            if (!article) {
                throw new Error('Artigo não encontrado');
            }
            
            // Construir HTML para impressão
            let printHTML = '<div style="font-size: 12pt; line-height: 1.5;">';
            
            // Cabeçalho
            if (printHeader) {
                const date = article.createdAt ? 
                    article.createdAt.toDate().toLocaleDateString('pt-BR') : 
                    new Date().toLocaleDateString('pt-BR');
                
                printHTML += \`
                    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24pt;">\${wikiNotPedia.escapeHtml(article.title || 'Sem título')}</h1>
                        <p style="margin: 5px 0 0 0; color: #666;">
                            Wiki Not Pédia • \${date} • Autor: \${wikiNotPedia.escapeHtml(article.author || 'Desconhecido')}
                        </p>
                    </div>
                \`;
            }
            
            // Conteúdo
            printHTML += \`
                <div style="text-align: justify;">
                    \${wikiNotPedia.escapeHtml(article.description || 'Sem conteúdo').replace(/\\n/g, '<br>')}
                </div>
            \`;
            
            // Rodapé
            if (printFooter) {
                printHTML += \`
                    <div style="border-top: 1px solid #ccc; margin-top: 30px; padding-top: 10px; font-size: 10pt; color: #666; text-align: center;">
                        <p>Documento gerado a partir da Wiki Not Pédia</p>
                        <p>URL: https://wikinotpedia.com/article/\${articleId}</p>
                        <p>Data de geração: \${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                \`;
            }
            
            printHTML += '</div>';
            
            // Mostrar pré-visualização
            previewContent.innerHTML = printHTML;
            printPreview.style.display = 'block';
            
            // Rolar para a pré-visualização
            printPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Erro ao gerar versão para impressão:', error);
            wikiNotPedia.showError('Erro ao gerar versão para impressão.');
        } finally {
            printBtn.innerHTML = '<i class="fas fa-print"></i> Gerar Versão para Impressão';
            printBtn.disabled = false;
        }
    };
    
    // Função para imprimir documento
    window.printDocument = function() {
        const printContent = document.getElementById('previewContent').innerHTML;
        
        // Criar janela de impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(\`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Versão para Impressão - Wiki Not Pédia</title>
                <style>
                    @media print {
                        @page {
                            margin: 2cm;
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 12pt;
                            line-height: 1.5;
                        }
                        h1 {
                            font-size: 24pt;
                            margin-bottom: 20px;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                \${printContent}
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()">Imprimir</button>
                    <button onclick="window.close()">Fechar</button>
                </div>
            </body>
            </html>
        \`);
        printWindow.document.close();
    };
    
    // Carregar artigos ao iniciar
    setTimeout(loadArticles, 100);
})();
