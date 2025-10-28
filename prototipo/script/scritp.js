<!-- Adicionar no final do <body> -->
<script type="module">
  // Importação via CDN
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

  // Configuração do seu projeto Firebase
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "wiki-work-world.firebaseapp.com",
    projectId: "wiki-work-world",
    storageBucket: "wiki-work-world.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:abcdef123456"
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
