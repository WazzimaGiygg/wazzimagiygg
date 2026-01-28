// script.js - Lógica principal da aplicação

// Referências globais
let citiesData = [];
let db = null;
let unsubscribe = null;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    if (typeof db === 'undefined' || !db) {
        console.error("❌ Firebase não está inicializado");
        updateConnectionStatus(false, "Firebase não inicializado");
        return;
    }
    
    db = window.db;
    updateConnectionStatus(true, "Conectado ao Firebase");
    
    // Carregar cidades
    loadCities();
    
    // Configurar listener em tempo real
    setupRealtimeListener();
}

function updateConnectionStatus(connected, message) {
    const statusDot = document.getElementById('firebaseStatus');
    const statusText = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = message;
        statusText.style.color = '#48bb78';
    } else {
        statusDot.className = 'status-dot';
        statusText.textContent = message;
        statusText.style.color = '#f56565';
    }
}

function setupEventListeners() {
    // Enter no input de busca
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkCity();
        }
    });
    
    // Auto-complete
    document.getElementById('cityInput').addEventListener('input', function(e) {
        showSuggestions(e.target.value);
    });
    
    // Atualizar hora
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    document.getElementById('lastUpdate').textContent = timeString;
}

function setupRealtimeListener() {
    try {
        unsubscribe = db.collection('cidadessancionadas')
            .where('ativa', '==', true)
            .onSnapshot(snapshot => {
                citiesData = [];
                snapshot.forEach(doc => {
                    const city = doc.data();
                    city.id = doc.id;
                    citiesData.push(city);
                });
                
                updateCitiesList();
                updateCityCount();
            }, error => {
                console.error("❌ Erro no listener em tempo real:", error);
            });
    } catch (error) {
        console.error("❌ Erro ao configurar listener:", error);
    }
}

async function loadCities() {
    try {
        const snapshot = await db.collection('cidadessancionadas')
            .where('ativa', '==', true)
            .orderBy('cidade')
            .get();
        
        citiesData = [];
        snapshot.forEach(doc => {
            const city = doc.data();
            city.id = doc.id;
            citiesData.push(city);
        });
        
        updateCitiesList();
        updateCityCount();
        
    } catch (error) {
        console.error("❌ Erro ao carregar cidades:", error);
        showMessage('error', 'Erro ao carregar cidades. Tente novamente.');
    }
}

function updateCityCount() {
    const countElement = document.getElementById('cityCount');
    countElement.textContent = citiesData.length;
}

function updateCitiesList(filter = '') {
    const citiesList = document.getElementById('citiesList');
    const searchTerm = filter.toLowerCase().trim();
    
    let filteredCities = citiesData;
    if (searchTerm) {
        filteredCities = citiesData.filter(city => 
            city.cidade.toLowerCase().includes(searchTerm) ||
            (city.moderador && city.moderador.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredCities.length === 0) {
        citiesList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhuma cidade encontrada</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredCities.forEach(city => {
        const date = city.data_criacao ? 
            formatDate(city.data_criacao.toDate ? city.data_criacao.toDate() : new Date(city.data_criacao)) : 
            'Data não disponível';
        
        html += `
            <div class="city-item" onclick="showCityDetails('${city.id}')">
                <div class="city-info">
                    <h4>${escapeHtml(city.cidade)}</h4>
                    <p>Moderador: ${escapeHtml(city.moderador || 'Não informado')}</p>
                    <small>Adicionada em: ${date}</small>
                </div>
                <div class="city-status">
                    <i class="fas fa-circle status-active"></i>
                    <span>Sancionada</span>
                </div>
            </div>
        `;
    });
    
    citiesList.innerHTML = html;
}

function filterCitiesList() {
    const filter = document.getElementById('filterCities').value;
    updateCitiesList(filter);
}

function showSuggestions(input) {
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (!input.trim()) {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    const searchTerm = input.toLowerCase();
    const matches = citiesData
        .filter(city => city.cidade.toLowerCase().includes(searchTerm))
        .slice(0, 5);
    
    if (matches.length === 0) {
        suggestionsDiv.innerHTML = '<div class="suggestion-item">Nenhuma sugestão encontrada</div>';
        suggestionsDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    matches.forEach(city => {
        html += `
            <div class="suggestion-item" onclick="selectSuggestion('${escapeHtml(city.cidade)}')">
                ${escapeHtml(city.cidade)}
                <small style="color: #718096; float: right;">
                    ${escapeHtml(city.moderador || '')}
                </small>
            </div>
        `;
    });
    
    suggestionsDiv.innerHTML = html;
    suggestionsDiv.style.display = 'block';
}

function selectSuggestion(cityName) {
    document.getElementById('cityInput').value = cityName;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('suggestions').style.display = 'none';
    checkCity();
}

async function checkCity() {
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();
    const resultDiv = document.getElementById('result');
    const checkBtn = document.getElementById('checkBtn');
    
    if (!cityName) {
        showMessage('warning', 'Por favor, digite o nome de uma cidade.');
        return;
    }
    
    // Desabilita o botão durante a busca
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    resultDiv.className = 'result-container';
    resultDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Verificando...</div>';
    
    try {
        // Busca no Firebase
        const snapshot = await db.collection('cidadessancionadas')
            .where('cidade', '==', cityName)
            .where('ativa', '==', true)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            // Cidade encontrada
            const doc = snapshot.docs[0];
            const city = doc.data();
            
            resultDiv.className = 'result-container sanctioned';
            resultDiv.innerHTML = `
                <div class="result-message">
                    <i class="fas fa-ban"></i>
                    <h3 style="color: #f56565;">Cidade Sancionada!</h3>
                    <p><strong>Cidade:</strong> ${escapeHtml(city.cidade)}</p>
                    <p><strong>Moderador:</strong> ${escapeHtml(city.moderador || 'Não informado')}</p>
                    ${city.observacoes ? `<p><strong>Observações:</strong> ${escapeHtml(city.observacoes)}</p>` : ''}
                    <div class="details-btn" onclick="showCityDetails('${doc.id}')">
                        <i class="fas fa-info-circle"></i> Ver detalhes completos
                    </div>
                </div>
            `;
        } else {
            // Cidade não encontrada
            resultDiv.className = 'result-container not-sanctioned';
            resultDiv.innerHTML = `
                <div class="result-message">
                    <i class="fas fa-check-circle"></i>
                    <h3 style="color: #48bb78;">Cidade Livre</h3>
                    <p>A cidade <strong>${escapeHtml(cityName)}</strong> não está na lista de sancionadas.</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error("❌ Erro ao verificar cidade:", error);
        resultDiv.innerHTML = `
            <div class="result-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3 style="color: #ed8936;">Erro na Verificação</h3>
                <p>Não foi possível verificar a cidade. Tente novamente.</p>
                <small>Erro: ${error.message}</small>
            </div>
        `;
    } finally {
        // Reabilita o botão
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-search"></i> Verificar';
    }
}

async function showCityDetails(cityId) {
    try {
        const doc = await db.collection('cidadessancionadas').doc(cityId).get();
        
        if (!doc.exists) {
            showMessage('error', 'Cidade não encontrada.');
            return;
        }
        
        const city = doc.data();
        const modal = document.getElementById('cityModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        // Formata datas
        const createdDate = city.data_criacao ? 
            formatDateTime(city.data_criacao.toDate ? city.data_criacao.toDate() : new Date(city.data_criacao)) : 
            'Não disponível';
        
        const updatedDate = city.data_atualizacao ? 
            formatDateTime(city.data_atualizacao.toDate ? city.data_atualizacao.toDate() : new Date(city.data_atualizacao)) : 
            'Não disponível';
        
        modalTitle.textContent = city.cidade;
        modalContent.innerHTML = `
            <div class="modal-details">
                <div class="detail-item">
                    <label><i class="fas fa-user-shield"></i> Moderador Responsável</label>
                    <span>${escapeHtml(city.moderador || 'Não informado')}</span>
                </div>
                
                ${city.observacoes ? `
                <div class="detail-item">
                    <label><i class="fas fa-sticky-note"></i> Observações</label>
                    <span>${escapeHtml(city.observacoes)}</span>
                </div>
                ` : ''}
                
                <div class="detail-item">
                    <label><i class="fas fa-calendar-plus"></i> Data de Criação</label>
                    <span>${createdDate}</span>
                </div>
                
                <div class="detail-item">
                    <label><i class="fas fa-calendar-check"></i> Última Atualização</label>
                    <span>${updatedDate}</span>
                </div>
                
                <div class="detail-item">
                    <label><i class="fas fa-toggle-on"></i> Status</label>
                    <span style="color: ${city.ativa ? '#48bb78' : '#f56565'};">
                        ${city.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                </div>
                
                <div class="detail-item">
                    <label><i class="fas fa-fingerprint"></i> ID do Documento</label>
                    <span style="font-family: monospace; font-size: 0.9rem;">${cityId}</span>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error("❌ Erro ao carregar detalhes:", error);
        showMessage('error', 'Erro ao carregar detalhes da cidade.');
    }
}

function closeModal() {
    document.getElementById('cityModal').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('cityModal');
    if (event.target === modal) {
        closeModal();
    }
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
    return date.toLocaleString('pt-BR');
}

function showMessage(type, text) {
    // Remove mensagens anteriores
    const existingMessages = document.querySelectorAll('.alert-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${text}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Estilos para a mensagem
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#ed8936'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Remove após 5 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .details-btn {
        margin-top: 15px;
        padding: 10px 15px;
        background: #667eea;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: background 0.3s ease;
    }
    
    .details-btn:hover {
        background: #5a67d8;
    }
`;
document.head.appendChild(style);
