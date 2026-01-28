// firebase-config.js
// Configuração do Firebase com inicialização única

// Configurações do seu projeto Firebase
const firebaseConfig = {
            apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
            authDomain: "wzzm-ce3fc.firebaseapp.com",
            projectId: "wzzm-ce3fc",
            storageBucket: "wzzm-ce3fc.appspot.com",
            messagingSenderId: "249427877153",
            appId: "1:249427877153:web:0e4297294794a5aadeb260"
        };

// Variáveis globais
let firebaseApp = null;
let db = null;
let firestore = null;

// Função para inicializar o Firebase
function initializeFirebase() {
    try {
        // Verifica se já foi inicializado
        if (!firebaseApp) {
            console.log("🔄 Inicializando Firebase...");
            
            // Inicializa o Firebase
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase inicializado com sucesso!");
            
            // Obtém o Firestore
            db = firebase.firestore();
            firestore = firebase.firestore;
            
            // Configurações opcionais para melhor performance
            if (typeof db.settings === 'function') {
                db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                });
            }
            
            // Habilita persistência offline
            if (typeof db.enablePersistence === 'function') {
                db.enablePersistence()
                    .then(() => {
                        console.log("📚 Persistência offline ativada");
                    })
                    .catch(err => {
                        if (err.code === 'failed-precondition') {
                            console.warn("⚠️ Persistência falhou: Múltiplas abas abertas");
                        } else if (err.code === 'unimplemented') {
                            console.warn("⚠️ Persistência não suportada pelo navegador");
                        } else {
                            console.error("❌ Erro na persistência:", err);
                        }
                    });
            }
            
            // Define como global para acesso fácil
            window.firebaseApp = firebaseApp;
            window.db = db;
            window.firestore = firestore;
            window.firebaseInitialized = true;
        }
        
        return db;
        
    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
        
        // Tenta verificar se já existe um app inicializado
        try {
            const apps = firebase.apps;
            if (apps && apps.length > 0) {
                firebaseApp = apps[0];
                db = firebase.firestore();
                firestore = firebase.firestore;
                
                window.firebaseApp = firebaseApp;
                window.db = db;
                window.firestore = firestore;
                window.firebaseInitialized = true;
                
                console.log("✅ Usando instância existente do Firebase");
                return db;
            }
        } catch (e) {
            console.error("❌ Não foi possível recuperar instância existente:", e);
        }
        
        return null;
    }
}

// Inicializa automaticamente quando o script carrega
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um momento para garantir que o DOM está pronto
    setTimeout(() => {
        const dbInstance = initializeFirebase();
        
        if (dbInstance) {
            console.log("🎉 Firebase pronto para uso!");
            
            // Dispara evento para notificar outros scripts
            const event = new Event('firebaseReady');
            window.dispatchEvent(event);
            
            // Atualiza status na UI se o elemento existir
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false);
        }
    }, 100);
});

// Função para atualizar status na interface
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('firebaseStatus');
    const statusText = document.getElementById('connectionStatus');
    
    if (statusElement && statusText) {
        if (connected) {
            statusElement.className = 'status-dot connected';
            statusText.textContent = 'Conectado ao Firebase';
            statusText.style.color = '#48bb78';
        } else {
            statusElement.className = 'status-dot';
            statusText.textContent = 'Desconectado do Firebase';
            statusText.style.color = '#f56565';
        }
    }
}

// Função auxiliar para verificar se está inicializado
function isFirebaseInitialized() {
    return window.firebaseInitialized === true && window.db !== null;
}

// Função para obter a instância do Firestore com segurança
function getFirestore() {
    if (isFirebaseInitialized()) {
        return window.db;
    } else {
        const db = initializeFirebase();
        if (db) {
            return db;
        } else {
            throw new Error('Firebase não foi inicializado');
        }
    }
}

// Exporta funções para uso global
window.initializeFirebase = initializeFirebase;
window.isFirebaseInitialized = isFirebaseInitialized;
window.getFirestore = getFirestore;
