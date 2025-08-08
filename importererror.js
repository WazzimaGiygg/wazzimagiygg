<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>

<script>
    const firebaseConfig = {
        apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
        authDomain: "wzzm-ce3fc.firebaseapp.com",
        projectId: "wzzm-ce3fc",
        storageBucket: "wzzm-ce3fc.appspot.com",
        messagingSenderId: "249427877153",
        appId: "1:249427877153:web:0e4297294794a5aadeb260",
        measurementId: "G-PLKNZNFCQ8"
    };

    // Inicialize o Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const firestore = firebase.firestore();

// A coleção onde os logs serão armazenados
const logCollection = firestore.collection('logeral');
let capturedErrors = [];

// Função para gerar um UID aleatório para cada log
function generateLogUid() {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

/**
 * Envia o log de erro para o Firestore.
 * @param {string} userAgent O User Agent do navegador.
 * @param {string} ipAddress O endereço IP do usuário.
 * @param {string} googleUid O UID do Google do usuário (se logado).
 * @param {Array<string>} errors Lista de strings de erros capturados.
 * @param {string} uid O UID único para este log.
 */
async function sendLogErrorToFirebase(userAgent, ipAddress, googleUid, errors, uid) {
    const logData = {
        uid, // UID do Log
        ipAddress: ipAddress,
        userAgent: userAgent,
        googleUid: googleUid,
        errors: errors.length > 0 ? errors.join('\n') : 'Nenhum erro de console registrado.',
        url: window.location.href,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        // Adicione outros dados pertinentes aqui, como status de login, etc.
        loggedIn: !!googleUid
    };

    try {
        await logCollection.doc(uid).set(logData);
        console.log(`Log de erro ${uid} enviado para o Firestore.`);
    } catch (error) {
        console.error("Erro ao enviar o log para o Firestore:", error);
    }
}

// --- Captura de Erros e Eventos ---

// Sobrescreve o console.error para capturar a mensagem antes de exibi-la
const originalConsoleError = console.error;
console.error = function(...args) {
    const errorMessage = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    capturedErrors.push(`[Console Error]: ${errorMessage}`);
    originalConsoleError.apply(console, args);
};

// Captura erros de script globais
window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = `[Window Error]: ${message} - Arquivo: ${source} - Linha: ${lineno}:${colno}`;
    capturedErrors.push(errorMessage);
    console.log("Erro de script capturado:", errorMessage);
};

// Captura promessas rejeitadas não tratadas
window.addEventListener('unhandledrejection', event => {
    const errorMessage = `[Unhandled Rejection]: ${event.reason.message || event.reason}`;
    capturedErrors.push(errorMessage);
    console.log("Promessa rejeitada capturada:", errorMessage);
});

// Envia o log quando a página é descarregada (fechada ou navegada)
window.addEventListener('beforeunload', async () => {
    // Usamos a variável global `currentUser` do seu código original para obter o UID
    const googleUid = auth.currentUser ? auth.currentUser.uid : null;
    const logUid = generateLogUid();

    // A busca por IP é assíncrona, então é melhor fazê-la separadamente e enviar o log sem esperar a resposta, ou usar um valor padrão.
    // Para simplificar, usaremos o valor padrão e faremos o fetch logo no início da página.
    let userIp = "Não detectado";
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIp = data.ip;
    } catch (error) {
        console.warn("Não foi possível obter o IP do usuário.", error);
    }

    // A chamada para enviar o log é assíncrona, mas o `beforeunload` não espera.
    // O navegador pode fechar antes do log ser enviado.
    // É uma limitação, mas é a melhor forma de tentar capturar o estado final.
    // Para logs críticos, é melhor enviar imediatamente ao ocorrer o erro.
    sendLogErrorToFirebase(navigator.userAgent, userIp, googleUid, capturedErrors, logUid);
});


// --- Exemplo de como usar a função imediatamente em um erro crítico ---

// Por exemplo, se uma função crítica falhar, você pode enviar o log imediatamente:
// function minhaFuncaoCritica() {
//     try {
//         // ... seu código que pode falhar
//     } catch (e) {
//         const errorLog = [`Erro crítico em minhaFuncaoCritica: ${e.message}`];
//         // Envia o log imediatamente
//         sendLogErrorToFirebase(navigator.userAgent, "IP_PADRAO", auth.currentUser ? auth.currentUser.uid : null, errorLog, generateLogUid());
//     }
// }
