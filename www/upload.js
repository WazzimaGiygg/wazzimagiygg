// upload.js
(function() {
    console.log('Script de Upload carregado');
    
    const actionBody = document.getElementById('actionBody');
    const actionTitle = document.getElementById('actionTitle');
    
    actionTitle.textContent = 'Enviar Arquivo';
    
    actionBody.innerHTML = \`
        <div class="form-group">
            <label class="form-label">Selecione o arquivo para upload:</label>
            <input type="file" id="fileInput" class="form-input" accept="image/*,.pdf,.doc,.docx,.txt">
            <div class="form-hint">Tipos permitidos: imagens, PDF, Word, texto (máx. 5MB)</div>
        </div>
        <div class="form-group">
            <label class="form-label">Descrição do arquivo:</label>
            <textarea id="fileDescription" class="form-input form-textarea" placeholder="Descreva o conteúdo do arquivo..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Categoria:</label>
            <select id="fileCategory" class="form-input">
                <option value="images">Imagens</option>
                <option value="documents">Documentos</option>
                <option value="other">Outros</option>
            </select>
        </div>
        <div class="form-group">
            <div class="checkbox-group">
                <input type="checkbox" id="fileLicense">
                <label for="fileLicense">Confirmo que tenho direitos sobre este arquivo ou ele está sob licença livre</label>
            </div>
        </div>
        <div class="form-group">
            <button class="btn btn-primary" onclick="uploadFile()" id="uploadBtn">
                <i class="fas fa-upload"></i> Enviar Arquivo
            </button>
            <button class="btn btn-secondary" onclick="wikiNotPedia.closeActionArea()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <div id="uploadProgress" style="display: none; margin-top: 20px;">
            <h4>Progresso do Upload:</h4>
            <div class="progress-bar" style="height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                <div id="progressFill" style="height: 100%; background: #3366cc; width: 0%; transition: width 0.3s;"></div>
            </div>
            <p id="progressText" style="text-align: center; margin-top: 5px;">0%</p>
        </div>
    \`;
    
    // Função para fazer upload do arquivo
    window.uploadFile = async function() {
        const fileInput = document.getElementById('fileInput');
        const fileDescription = document.getElementById('fileDescription').value.trim();
        const fileCategory = document.getElementById('fileCategory').value;
        const fileLicense = document.getElementById('fileLicense').checked;
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            wikiNotPedia.showError('Selecione um arquivo primeiro!');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Validar tamanho do arquivo (5MB)
        if (file.size > 5 * 1024 * 1024) {
            wikiNotPedia.showError('O arquivo é muito grande. Tamanho máximo: 5MB');
            return;
        }
        
        if (!fileDescription) {
            wikiNotPedia.showError('Descreva o conteúdo do arquivo!');
            return;
        }
        
        if (!fileLicense) {
            wikiNotPedia.showError('Você precisa confirmar os direitos sobre o arquivo!');
            return;
        }
        
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        uploadBtn.disabled = true;
        uploadProgress.style.display = 'block';
        
        // Simular progresso do upload
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 90) {
                clearInterval(progressInterval);
            }
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }, 200);
        
        try {
            // Em uma implementação real, você enviaria o arquivo para um servidor
            // Aqui estamos simulando o upload
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Registrar o upload no banco de dados
            const uploadRecord = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                description: fileDescription,
                category: fileCategory,
                uploadedBy: wikiNotPedia.currentUser?.uid || 'anonymous',
                uploadedAt: wikiNotPedia.firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            };
            
            await wikiNotPedia.db.collection('uploads').add(uploadRecord);
            
            // Completar progresso
            clearInterval(progressInterval);
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            wikiNotPedia.showSuccess('Arquivo enviado com sucesso!');
            
            // Resetar formulário
            fileInput.value = '';
            document.getElementById('fileDescription').value = '';
            document.getElementById('fileLicense').checked = false;
            
            // Esconder progresso
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = '0%';
            }, 1000);
            
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
            clearInterval(progressInterval);
            wikiNotPedia.showError('Erro ao enviar arquivo. Tente novamente.');
        } finally {
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Enviar Arquivo';
            uploadBtn.disabled = false;
        }
    };
})();
