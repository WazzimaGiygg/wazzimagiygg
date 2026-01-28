// firebase-config.js
// Configuração do Firebase

        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
            authDomain: "wzzm-ce3fc.firebaseapp.com",
            projectId: "wzzm-ce3fc",
            storageBucket: "wzzm-ce3fc.appspot.com",
            messagingSenderId: "249427877153",
            appId: "1:249427877153:web:0e4297294794a5aadeb260"
        };

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    console.log("✅ Firebase inicializado com sucesso!");
    
    // Configurações do Firestore
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // Exportar para uso global
    window.firebaseApp = firebase;
    window.db = db;
    window.firestore = firebase.firestore;
    
} catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
    alert("Erro ao conectar com o banco de dados. Verifique o console.");
}
