// dashboard.js - Lógica do Painel Administrativo

let allCities = [];
let db = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDashboardListeners();
});

function initializeDashboard() {
    if (typeof db === 'undefined' || !db) {
        console.error("❌ Firebase não está inicializado");
        return;
    }
    
    db = window.db;
    loadAllCities();
}

function setupDashboardListeners() {
    // Enter no formulário
    document.getElementById('newCityName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewCity();
        }
    });
    
    document.getElementById('newCityModerator').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewCity();
        }
    });
    
    // Importação de arquivo
    document.getElementById('jsonFileInput').addEventListener('change', handleFileImport);
}

async function loadAllCities() {
    try {
        const snapshot = await db.collection('cidadessancionadas')
            .orderBy('data_criacao', 'desc')
            .get();
        
        allCities = [];
        snapshot.forEach(doc => {
            const city = doc.data();
            city.id = doc.id;
            allCities.push(city);
        });
        
        updateManagementList();
        updateStatistics();
        
    } catch (error) {
        console.error("❌ Erro ao carregar cidades:", error);
        showMessage('error', 'Erro ao carregar cidades do banco de dados.');
    }
}

function updateStatistics() {
    const activeCities = allCities.filter(city => city.ativa);
    const inactiveCities = allCities.filter(city => !city.ativa);
    
    // Moderadores únicos
    const moderators = [...new Set(allCities.map(city => city.moderador).filter(Boolean))];
    
    // Última adição
    const lastAdded = allCities.length > 0 ? 
        formatDate(allCities[0].data_criacao?.toDate?.() || new Date()) : 
        'Nenhuma';
    
    // Atualiza estatísticas
    document.getElementById('totalCities').textContent = allCities.length;
    document.getElementById('activeCount').textContent = activeCities.length;
    document.getElementById('inactiveCount').textContent = inactiveCities.length;
    document.getElementById('moderatorsCount').textContent = moderators.length;
    document.getElementById('lastAdded').textContent = lastAdded;
}

function updateManagementList() {
    const container = document.getElementById('citiesManagement');
    const statusFilter = document.getElementById('statusFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    let filteredCities = allCities;
    
    // Filtro por status
    if (statusFilter === 'active') {
        filteredCities = filteredCities.filter(city => city.ativa);
    } else if (statusFilter === 'inactive') {
        filteredCities = filteredCities.filter(city => !city.ativa);
    }
    
    // Filtro por busca
    if (searchFilter) {
        filteredCities = filteredCities.filter(city => 
            city.cidade.toLowerCase().includes(searchFilter) ||
            (city.moderador && city.moderador.toLowerCase().includes(searchFilter)) ||
            (city.observacoes && city.observacoes.toLowerCase().includes(searchFilter))
        );
    }
    
    if (filteredCities.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhuma cidade encontrada</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="cities-table">';
    
    filteredCities.forEach(city => {
        const createdDate = formatDateTime(city.data_criacao?.toDate?.() || new Date(city.data_criacao));
        const statusClass = city.ativa ? 'status-active' : 'status-inactive';
        const statusText = city.ativa ? 'Ativa' : 'Inativa';
        
        html += `
            <div class="city-row">
                <div class="city-cell">
                    <h4>${escapeHtml(city.cidade)}</h4>
                    <p><strong>Moderador:</strong> ${escapeHtml(city.moderador || 'Não informado')}</p>
                    <small>Criado em: ${createdDate}</small>
                </div>
                
                <div class="city-cell status-cell">
                    <span class="status-badge ${statusClass}">
                        <i class="fas fa-circle"></i> ${statusText}
                    </span>
                </div>
                
                <div class="city-cell actions-cell">
                    <button onclick="editCity('${city.id}')" class="btn-action btn-edit">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    <button onclick="toggleCityStatus('${city.id}', ${!city.ativa})" 
                            class="btn-action ${city.ativa ? 'btn-deactivate' : 'btn-activate'}">
                        <i class="fas ${city.ativa ? 'fa-toggle-off' : 'fa-toggle-on'}"></i>
                        ${city.ativa ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button onclick="deleteCity('${city.id}')" class="btn-action btn-delete">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function filterCities() {
    updateManagementList();
}

async function addNewCity() {
    const nameInput = document.getElementById('newCityName');
    const moderatorInput = document.getElementById('newCityModerator');
    const notesInput = document.getElementById('newCityNotes');
    
    const cityName = nameInput.value.trim();
    const moderator = moderatorInput.value.trim();
    const notes = notesInput.value.trim();
    
    // Validação
    if (!cityName) {
        showMessage('warning', 'Por favor, informe o nome da cidade.');
        nameInput.focus();
        return;
    }
    
    if (!moderator) {
        showMessage('warning', 'Por favor, informe o moderador responsável.');
        moderatorInput.focus();
        return;
    }
    
    try {
        // Verifica se já existe uma cidade ativa com o mesmo nome
        const snapshot = await db.collection('cidadessancionadas')
            .where('cidade', '==', cityName)
            .where('ativa', '==', true)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            showMessage('warning', `A cidade "${cityName}" já está na lista de sancionadas.`);
            return;
        }
        
        // Dados da nova cidade
        const cityData = {
            cidade: cityName,
            moderador: moderator,
            observacoes: notes,
            data_criacao: firestore.FieldValue.serverTimestamp(),
            data_atualizacao: firestore.FieldValue.serverTimestamp(),
            ativa: true
        };
        
        // Adiciona ao Firestore
        await db.collection('cidadessancionadas').add(cityData);
        
        showMessage('success', `Cidade "${cityName}" adicionada com sucesso!`);
        
        // Limpa o formulário
        clearForm();
        
        // Recarrega a lista
        await loadAllCities();
        
        // Adiciona ao log de atividades
        addActivityLog('add', cityName, moderator);
        
    } catch (error) {
        console.error("❌ Erro ao adicionar cidade:", error);
        showMessage('error', 'Erro ao adicionar cidade. Tente novamente.');
    }
}

function clearForm() {
    document.getElementById('newCityName').value = '';
    document.getElementById('newCityModerator').value = '';
    document.getElementById('newCityNotes').value = '';
    document.getElementById('newCityName').focus();
}

async function editCity(cityId) {
    try {
        const doc = await db.collection('cidadessancionadas').doc(cityId).get();
        
        if (!doc.exists) {
            showMessage('error', 'Cidade não encontrada.');
            return;
        }
        
        const city = doc.data();
        const modal = document.getElementById('editModal');
        
        document.getElementById('editFormContent').innerHTML = `
            <form onsubmit="updateCity('${cityId}'); return false;">
                <div class="form-group">
                    <label for="editCityName">Nome da Cidade *</label>
                    <input type="text" id="editCityName" value="${escapeHtml(city.cidade)}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCityModerator">Moderador Responsável *</label>
                    <input type="text" id="editCityModerator" value="${escapeHtml(city.moderador || '')}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCityNotes">Observações</label>
                    <textarea id="editCityNotes" rows="4">${escapeHtml(city.observacoes || '')}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editCityStatus">Status</label>
                    <select id="editCityStatus">
                        <option value="true" ${city.ativa ? 'selected' : ''}>Ativa</option>
                        <option value="false" ${!city.ativa ? 'selected' : ''}>Inativa</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Salvar Alterações
                    </button>
                    <button type="button" onclick="closeEditModal()" class="btn-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error("❌ Erro ao carregar cidade para edição:", error);
        showMessage('error', 'Erro ao carregar dados da cidade.');
    }
}

async function updateCity(cityId) {
    try {
        const name = document.getElementById('editCityName').value.trim();
        const moderator = document.getElementById('editCityModerator').value.trim();
        const notes = document.getElementById('editCityNotes').value.trim();
        const status = document.getElementById('editCityStatus').value === 'true';
        
        if (!name || !moderator) {
            showMessage('warning', 'Nome da cidade e moderador são obrigatórios.');
            return;
        }
        
        const updates = {
            cidade: name,
            moderador: moderator,
            observacoes: notes,
            ativa: status,
            data_atualizacao: firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('cidadessancionadas').doc(cityId).update(updates);
        
        showMessage('success', 'Cidade atualizada com sucesso!');
        closeEditModal();
        await loadAllCities();
        
        addActivityLog('update', name, moderator);
        
    } catch (error) {
        console.error("❌ Erro ao atualizar cidade:", error);
        showMessage('error', 'Erro ao atualizar cidade.');
    }
}

async function toggleCityStatus(cityId, newStatus) {
    try {
        const city = allCities.find(c => c.id === cityId);
        if (!city) return;
        
        await db.collection('cidadessancionadas').doc(cityId).update({
            ativa: newStatus,
            data_atualizacao: firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('success', `Cidade ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
        await loadAllCities();
        
        addActivityLog(newStatus ? 'activate' : 'deactivate', city.cidade, city.moderador);
        
    } catch (error) {
        console.error("❌ Erro ao alterar status:", error);
        showMessage('error', 'Erro ao alterar status da cidade.');
    }
}

async function deleteCity(cityId) {
    const city = allCities.find(c => c.id === cityId);
    if (!city) return;
    
    if (!confirm(`Tem certeza que deseja excluir a cidade "${city.cidade}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        await db.collection('cidadessancionadas').doc(cityId).delete();
        
        showMessage('success', `Cidade "${city.cidade}" excluída com sucesso!`);
        await loadAllCities();
        
        addActivityLog('delete', city.cidade, city.moderador);
        
    } catch (error) {
        console.error("❌ Erro ao excluir cidade:", error);
        showMessage('error', 'Erro ao excluir cidade.');
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function exportToJSON() {
    try {
        const exportData = {
            cidades_sancionadas: allCities.map(city => ({
                cidade: city.cidade,
                moderador: city.moderador,
                observacoes: city.observacoes || '',
                ativa: city.ativa,
                data_criacao: city.data_criacao?.toDate?.()?.toISOString() || city.data_criacao,
                data_atualizacao: city.data_atualizacao?.toDate?.()?.toISOString() || city.data_atualizacao
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `cidades-sancionadas-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showMessage('success', 'Exportação concluída com sucesso!');
        
    } catch (error) {
        console.error("❌ Erro ao exportar dados:", error);
        showMessage('error', 'Erro ao exportar dados.');
    }
}

function importFromJSON() {
    document.getElementById('jsonFileInput').click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('Importar cidades deste arquivo? Cidades existentes com o mesmo nome serão atualizadas.')) {
        event.target.value = '';
        return;
    }
    
    try {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                if (!jsonData.cidades_sancionadas || !Array.isArray(jsonData.cidades_sancionadas)) {
                    throw new Error('Formato de arquivo inválido. O arquivo deve conter um array "cidades_sancionadas".');
                }
                
                let importedCount = 0;
                let updatedCount = 0;
                
                for (const cidadeData of jsonData.cidades_sancionadas) {
                    if (!cidadeData.cidade || !cidadeData.moderador) {
                        console.warn('Cidade ignorada - dados incompletos:', cidadeData);
                        continue;
                    }
                    
                    // Verifica se já existe
                    const snapshot = await db.collection('cidadessancionadas')
                        .where('cidade', '==', cidadeData.cidade)
                        .limit(1)
                        .get();
                    
                    if (!snapshot.empty) {
                        // Atualiza existente
                        const doc = snapshot.docs[0];
                        await doc.ref.update({
                            moderador: cidadeData.moderador,
                            observacoes: cidadeData.observacoes || '',
                            ativa: cidadeData.ativa !== undefined ? cidadeData.ativa : true,
                            data_atualizacao: firestore.FieldValue.serverTimestamp()
                        });
                        updatedCount++;
                    } else {
                        // Cria nova
                        const newCity = {
                            cidade: cidadeData.cidade,
                            moderador: cidadeData.moderador,
                            observacoes: cidadeData.observacoes || '',
                            ativa: cidadeData.ativa !== undefined ? cidadeData.ativa : true,
                            data_criacao: firestore.FieldValue.serverTimestamp(),
                            data_atualizacao: firestore.FieldValue.serverTimestamp()
                        };
                        
                        await db.collection('cidadessancionadas').add(newCity);
                        importedCount++;
                    }
                }
                
                showMessage('success', `Importação concluída! ${importedCount} novas cidades, ${updatedCount} atualizadas.`);
                
                // Limpa o input
                event.target.value = '';
                
                // Recarrega os dados
                await loadAllCities();
                
            } catch (error) {
                console.error("❌ Erro ao processar arquivo:", error);
                showMessage('error', `Erro ao processar arquivo: ${error.message}`);
                event.target.value = '';
            }
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        console.error("❌ Erro ao ler arquivo:", error);
        showMessage('error', 'Erro ao ler arquivo.');
        event.target.value = '';
    }
}

function addActivityLog(action, cityName, moderator) {
    const logList = document.getElementById('activityLog');
    const actions = {
        'add': { icon: 'plus-circle', color: '#48bb78', text: 'adicionada' },
        'update': { icon: 'edit', color: '#667eea', text: 'atualizada' },
        'delete': { icon: 'trash', color: '#f56565', text: 'excluída' },
        'activate': { icon: 'toggle-on', color: '#48bb78', text: 'ativada' },
        'deactivate': { icon: 'toggle-off', color: '#f56565', text: 'desativada' }
    };
    
    const actionInfo = actions[action] || { icon: 'info-circle', color: '#718096', text: 'modificada' };
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerHTML = `
        <i class="fas fa-${actionInfo.icon}" style="color: ${actionInfo.actionInfo}"></i>
        <span>
            <strong>${cityName}</strong> ${actionInfo.text} por ${moderator}
            <small>${formatTime(new Date())}</small>
        </span>
    `;
    
    // Adiciona no início da lista
    logList.insertBefore(logItem, logList.firstChild);
    
    // Mantém apenas os últimos 10 itens
    const items = logList.querySelectorAll('.log-item');
    if (items.length > 10) {
        logList.removeChild(items[items.length - 1]);
    }
}

function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR');
}

// Adiciona estilos específicos para o dashboard
const dashboardStyles = `
    .header-actions {
        margin-top: 20px;
    }
    
    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #4a5568;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        transition: background 0.3s ease;
    }
    
    .back-btn:hover {
        background: #2d3748;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .full-width {
        grid-column: 1 / -1;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #4a5568;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #667eea;
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .btn-primary, .btn-secondary, .btn-export, .btn-import {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.3s ease;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .btn-secondary {
        background: #e2e8f0;
        color: #4a5568;
    }
    
    .btn-export {
        background: #48bb78;
        color: white;
    }
    
    .btn-import {
        background: #ed8936;
        color: white;
    }
    
    .btn-primary:hover, .btn-secondary:hover, .btn-export:hover, .btn-import:hover {
        opacity: 0.9;
    }
    
    .filters {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .filter-group label {
        display: block;
        margin-bottom: 8px;
        color: #4a5568;
    }
    
    .cities-table {
        max-height: 500px;
        overflow-y: auto;
    }
    
    .city-row {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr;
        gap: 20px;
        padding: 15px;
        border-bottom: 1px solid #e2e8f0;
        align-items: center;
    }
    
    .city-row:hover {
        background: #f7fafc;
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .status-active {
        background: #c6f6d5;
        color: #22543d;
    }
    
    .status-inactive {
        background: #fed7d7;
        color: #742a2a;
    }
    
    .actions-cell {
        display: flex;
        gap: 10px;
    }
    
    .btn-action {
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    
    .btn-edit {
        background: #e2e8f0;
        color: #4a5568;
    }
    
    .btn-activate {
        background: #c6f6d5;
        color: #22543d;
    }
    
    .btn-deactivate {
        background: #fed7d7;
        color: #742a2a;
    }
    
    .btn-delete {
        background: #fff5f5;
        color: #c53030;
        border: 1px solid #fed7d7;
    }
    
    .export-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }
    
    .stat-card {
        background: #f7fafc;
        border-radius: 10px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
    }
    
    .stat-info h3 {
        font-size: 1.8rem;
        color: #2d3748;
        margin: 0;
    }
    
    .stat-info p {
        color: #718096;
        margin: 0;
        font-size: 0.9rem;
    }
    
    .activity-log {
        margin-top: 30px;
    }
    
    .log-list {
        margin-top: 15px;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .log-item {
        padding: 10px 15px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .log-item:last-child {
        border-bottom: none;
    }
    
    .log-item small {
        color: #a0aec0;
        margin-left: 10px;
        font-size: 0.8rem;
    }
`;

// Adiciona os estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet);
