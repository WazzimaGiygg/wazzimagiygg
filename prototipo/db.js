// firebase/db.js
import { db } from "./config.js";
import { 
  collection, addDoc, getDocs, updateDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ➕ Criar um novo artigo colaborativo
export async function criarArtigo(titulo, conteudo, autor) {
  try {
    const docRef = await addDoc(collection(db, "articles"), {
      titulo,
      conteudo,
      autor,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });
    console.log("📄 Artigo criado com ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao criar artigo:", e);
  }
}

// 📋 Listar todos os artigos
export async function listarArtigos() {
  const querySnapshot = await getDocs(collection(db, "articles"));
  const artigos = [];
  querySnapshot.forEach((doc) => {
    artigos.push({ id: doc.id, ...doc.data() });
  });
  return artigos;
}

// ✏️ Atualizar artigo existente
export async function atualizarArtigo(id, novosDados) {
  const artigoRef = doc(db, "articles", id);
  await updateDoc(artigoRef, { ...novosDados, atualizadoEm: serverTimestamp() });
  console.log(`🛠️ Artigo ${id} atualizado.`);
}
