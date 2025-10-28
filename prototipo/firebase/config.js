<!-- Adicionar no final do <body> -->
<script type="module">
  // Importação via CDN
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0", // Chave de API, mantenha a sua real
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260",
    measurementId: "G-PLKNZNFCQ8"
};

  // Inicializar
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Exemplo: adicionar um dado colaborativo
  async function addArticle() {
    const docRef = await addDoc(collection(db, "artigos"), {
      titulo: "Primeiro artigo colaborativo",
      autor: "Anônimo",
      data: new Date().toISOString()
    });
    console.log("Artigo adicionado com ID:", docRef.id);
  }

  addArticle();
</script>
