// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;
let selectedAmount = 10;

const PIX_KEY = "27bf799c-0836-4673-9054-d5a13601ace7";

function copyPix() {
    navigator.clipboard.writeText(PIX_KEY);
    alert('✅ Chave PIX copiada! Agora cole no seu aplicativo bancário.');
}

function setAmount(amount) {
    selectedAmount = amount;
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function setCustomAmount() {
    const custom = document.getElementById('custom-amount').value;
    if (custom && parseFloat(custom) > 0) {
        selectedAmount = parseFloat(custom);
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
    }
}

function openConfirmation() {
    if (!currentUser) {
        alert('Faça login primeiro para registrar sua doação');
        showLoginModal();
        return;
    }
    document.getElementById('confirm-amount').innerHTML = `R$ ${selectedAmount.toFixed(2)}`;
    document.getElementById('confirm-modal').style.display = 'flex';
}

function completeDonation() {
    closeModal();
    saveDonation();
}

async function saveDonation() {
    try {
        const donationData = {
            donorId: currentUser.uid,
            donorName: currentUser.displayName || 'Anônimo',
            donorEmail: currentUser.email,
            amount: selectedAmount,
            pixKey: PIX_KEY,
            createdAt: new Date().toISOString()
        };
        
        await db.collection('doacoes_wzzm').add(donationData);
        
        showReceipt(donationData);
    } catch (error) {
        console.error('Erro:', error);
        showReceipt({
            donorName: currentUser.displayName || 'Anônimo',
            donorEmail: currentUser.email,
            amount: selectedAmount,
            pixKey: PIX_KEY,
            createdAt: new Date().toISOString()
        });
    }
}

function showReceipt(data) {
    const date = new Date().toLocaleString('pt-BR');
    const receiptId = 'WZM-' + Date.now().toString(36).toUpperCase();
    
    document.getElementById('receipt-content').innerHTML = `
        <p><strong>Comprovante:</strong> ${receiptId}</p>
        <p><strong>Data:</strong> ${date}</p>
        <p><strong>Doador:</strong> ${escapeHtml(data.donorName)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(data.donorEmail)}</p>
        <hr style="margin: 15px 0;">
        <p style="font-size: 1.5em; text-align: center;"><strong>R$ ${data.amount.toFixed(2)}</strong></p>
        <hr style="margin: 15px 0;">
        <p><strong>Forma:</strong> PIX</p>
        <p><strong>Chave:</strong> ${PIX_KEY}</p>
        <p><strong>Status:</strong> ✅ Confirmado</p>
        <p style="margin-top: 15px;">Obrigado por apoiar o WazzimaGiygg! 💝</p>
    `;
    
    document.getElementById('receipt-modal').style.display = 'flex';
}

function showLoginModal() {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Autenticação
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        document.querySelector('.header p').innerHTML = `👋 Olá, ${user.displayName || user.email}! Sua doação faz a diferença 💝`;
    }
});

// Expor funções globalmente
window.copyPix = copyPix;
window.setAmount = setAmount;
window.setCustomAmount = setCustomAmount;
window.openConfirmation = openConfirmation;
window.completeDonation = completeDonation;
window.closeModal = closeModal;
window.showLoginModal = showLoginModal;
