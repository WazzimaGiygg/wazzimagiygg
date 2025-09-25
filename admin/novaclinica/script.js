// Sua configuração do Firebase
// Substitua estes valores pelos dados do seu projeto Firebase!
        const firebaseConfig = {
            apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0", // Use sua própria chave! /* cite: 79 */
            authDomain: "wzzm-ce3fc.firebaseapp.com", /* cite: 79 */
            projectId: "wzzm-ce3fc", /* cite: 79 */
            storageBucket: "wzzm-ce3fc.appspot.com", /* cite: 79 */
            messagingSenderId: "249427877153", /* cite: 79 */
            appId: "1:249427877153:web:0e4297294794a5aadeb260", /* cite: 79 */
            measurementId: "G-PLKNZNFCQ8" /* cite: 79 */
        };

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Obtém as instâncias do Firestore e Authentication
const db = firebase.firestore();
const auth = firebase.auth();

const clientForm = document.getElementById('clientForm');
const loggedInUserUID = document.getElementById('loggedInUserUID');
const messageElement = document.getElementById('message');

// Função para exibir mensagens ao usuário
function showMessage(msg, type) {
    messageElement.textContent = msg;
    messageElement.className = `message ${type}`;
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 5000); // Remove a mensagem após 5 segundos
}

// Ouve o estado de autenticação do usuário
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuário logado
        loggedInUserUID.textContent = user.uid;
        // console.log("Usuário logado:", user.uid);
        // Exemplo: você pode querer preencher os campos do formulário se o UID já tiver dados
        // db.collection('cliente').doc(user.uid).get().then(doc => { ... });
    } else {
        // Nenhum usuário logado
        loggedInUserUID.textContent = "Nenhum usuário logado. Por favor, faça login.";
        // console.log("Nenhum usuário logado.");

        // Redirecione para uma página de login ou exiba um botão de login se necessário
        // Neste exemplo simplificado, vamos pedir para fazer login para continuar
        showMessage("Por favor, faça login para salvar as configurações.", "error");
        clientForm.style.display = 'none'; // Esconde o formulário se não houver login
    }
});

// Lida com o envio do formulário
clientForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const user = auth.currentUser;

    if (!user) {
        showMessage("Nenhum usuário logado. Não é possível salvar as configurações.", "error");
        return;
    }

    const uidClienteGoogleLogado = user.uid;

    // Pega os valores dos campos do formulário
    const formData = {
        apiKey: clientForm.apiKey.value,
        authDomain: clientForm.authDomain.value,
        projectId: clientForm.projectId.value,
        storageBucket: clientForm.storageBucket.value,
        messagingSenderId: clientForm.messagingSenderId.value,
        appId: clientForm.appId.value,
        measurementId: clientForm.measurementId.value
    };

    try {
        // Salva os dados na coleção 'cliente' usando o UID do usuário como ID do documento
        await db.collection('cliente').doc(uidClienteGoogleLogado).set(formData);
        showMessage("Configurações salvas com sucesso!", "success");
        // Opcional: Limpar formulário ou redirecionar
        // clientForm.reset();
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        showMessage(`Erro ao salvar configurações: ${error.message}`, "error");
    }
});

// ATENÇÃO: Para testar, você precisará ter um usuário logado no Firebase Authentication.
// Se você ainda não tem um sistema de login, pode adicionar um botão/função de login
// aqui para fins de teste, por exemplo:
/*
async function signInAnonymously() {
    try {
        await auth.signInAnonymously();
        console.log("Usuário anônimo logado para teste.");
    } catch (error) {
        console.error("Erro ao logar anonimamente:", error);
    }
}
// Chame essa função em algum lugar, talvez em um botão ou ao carregar a página para teste
// signInAnonymously();
*/

// OU configure o Google Sign-In, por exemplo:
/*
document.getElementById('googleSignInBtn').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error("Erro no login com Google:", error);
    }
});
*/
