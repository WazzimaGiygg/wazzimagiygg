// firebase/auth.js
import { auth, db } from "./config.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { doc, setDoc } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// 🔑 Login com Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Salva o usuário no Firestore
    await setDoc(doc(db, "users", user.uid), {
      nome: user.displayName,
      email: user.email,
      foto: user.photoURL,
      ultimoLogin: new Date().toISOString()
    }, { merge: true });

    console.log("👤 Usuário logado:", user.displayName);
    alert(`Bem-vindo, ${user.displayName}!`);
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Falha ao fazer login. Tente novamente.");
  }
}

// 🚪 Logout
export async function logoutUser() {
  await signOut(auth);
  console.log("🚪 Usuário desconectado");
}

// 🔍 Monitorar estado do usuário
export function monitorarUsuario(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Usuário ativo:", user.displayName);
      callback(user);
    } else {
      console.log("❌ Nenhum usuário logado.");
      callback(null);
    }
  });
}
