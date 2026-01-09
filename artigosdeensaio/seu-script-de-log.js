// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260",
    measurementId: "G-PLKNZNFCQ8"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Constantes
const USER_LOGS_COLLECTION = "checkuser";

// Função para gerar ID de sessão
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Função para obter dados de IP
async function getIPData() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao obter dados de IP:", error);
        return {};
    }
}

// Função principal de registro
async function registerUserLog(user, action = "Artigo de Ensaio") {
    try {
        // Coletar informações do navegador
        const browserInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            colorDepth: window.screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer,
            pageUrl: window.location.href
        };

        // Coletar IP e localização
        const ipData = await getIPData();
        const locationInfo = {
            ip: ipData?.ip || 'N/A',
            city: ipData?.city || 'Desconhecida',
            region: ipData?.region || 'Desconhecido',
            country: ipData?.country || 'Desconhecido',
            loc: ipData?.loc || 'N/A',
            org: ipData?.org || 'N/A',
            postal: ipData?.postal || 'N/A',
            timezone: ipData?.timezone || 'N/A'
        };

        // Informações do usuário
        const userInfo = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: user.providerId,
            emailVerified: user.emailVerified
        };

        // Dados do log
        const logData = {
            user: userInfo,
            location: locationInfo,
            browser: browserInfo,
            action: action,
            timestamp: serverTimestamp(),
            clientTimestamp: new Date().toISOString(),
            sessionId: generateSessionId(),
            source: "iframe_logger"
        };

        // Registrar no Firestore
        const logsRef = collection(db, USER_LOGS_COLLECTION);
        await addDoc(logsRef, logData);
        
        console.log("✅ Log registrado com sucesso!");
        
        // Enviar mensagem de sucesso para o parent
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'LOGGING_SUCCESS',
                userId: user.uid,
                timestamp: new Date().toISOString(),
                action: action
            }, '*');
        }
        
        return logData;
        
    } catch (error) {
        console.error("❌ Erro ao registrar log:", error);
        
        // Enviar mensagem de erro para o parent
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'LOGGING_ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            }, '*');
        }
        
        throw error;
    }
}

// Função para inicializar o registrador
async function initializeLogger() {
    console.log("🔄 Inicializando registrador de logs...");
    
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const logResult = await registerUserLog(user, "Artigo de Ensaio");
                    resolve({
                        success: true,
                        user: user,
                        log: logResult
                    });
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve({
                    success: false,
                    message: "Usuário não autenticado"
                });
            }
        });
    });
}

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', function() {
    console.log("📝 Script de registro de logs carregado");
    
    setTimeout(async () => {
        try {
            await initializeLogger();
        } catch (error) {
            console.warn("⚠️ Não foi possível inicializar o registrador:", error);
        }
    }, 1000);
});

// Exportar para uso externo
window.iframeLogger = {
    initialize: initializeLogger,
    getCurrentUser: () => auth.currentUser
};
