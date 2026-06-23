import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  increment,
  writeBatch,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

// The user's specific Firebase config from their original site
const firebaseConfig = {
  apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
  authDomain: "wzzm-ce3fc.firebaseapp.com",
  projectId: "wzzm-ce3fc",
  storageBucket: "wzzm-ce3fc.appspot.com",
  messagingSenderId: "249427877153",
  appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ============================================
// TYPES
// ============================================
export interface Article {
  id: string;
  titulo: string;
  descricao: string;
  setor: string;
  criadorEmail: string;
  dataCriacao: any;
  ultimaEdicao: any;
  visualizacoes: number;
  colecao: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  titulo: string;
  mensagem: string;
  timestamp: any;
  lida: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  profilePictureUrl: string;
  isAdmin: boolean;
  isBanned: boolean;
  isTeacher: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

// ============================================
// FIRESTORE ERROR HANDLING (SKILL REQUIREMENT)
// ============================================
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    }
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// REGISTRATION & USER PROFILE
// ============================================
export async function registerUser(user: User | { uid: string; displayName?: string; email?: string; photoURL?: string }, isGuest = false) {
  const uid = user.uid;
  const userData = {
    uid: uid,
    email: user.email || (isGuest ? `${uid}@guest.local` : ""),
    name: user.displayName || (isGuest ? "Convidado" : "Usuário"),
    profilePictureUrl: user.photoURL || "",
    isAdmin: false,
    isBan: false,
    isBanned: false,
    isTeacher: false,
    isTeatcher: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };

  try {
    // Write in both "users" and "usuários" collections to match existing backends
    await setDoc(doc(db, "users", uid), userData, { merge: true });
    await setDoc(doc(db, "usuários", uid), userData, { merge: true });
    console.log(`User ${uid} registered successfully!`);
    return true;
  } catch (error) {
    console.error("Error registering user:", error);
    // Don't crash entirely on analytics registration failure
    return false;
  }
}

export async function checkIfUserIsBanned(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.isBanned === true || data.isBan === true;
    }
  } catch (error) {
    console.warn("Could not check user ban status:", error);
  }
  return false;
}

export async function checkIfUserIsAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.isAdmin === true;
    }
  } catch (error) {
    console.warn("Could not check user admin status:", error);
  }
  return false;
}

// ============================================
// CONTENT LOADING
// ============================================
export async function loadCollectionContent(collectionName: string): Promise<Article[]> {
  try {
    const q = query(collection(db, collectionName), orderBy("ultimaEdicao", "desc"));
    const snapshot = await getDocs(q);
    const items: Article[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      items.push({
        id: docSnapshot.id,
        titulo: data.titulo || "Sem título",
        descricao: data.descricao || "",
        setor: data.setor || (collectionName === "academico" ? "Acadêmico" : collectionName === "uwgbooks" ? "UWG Books" : "Geral"),
        criadorEmail: data.criadorEmail || "Sistema",
        dataCriacao: data.dataCriacao,
        ultimaEdicao: data.ultimaEdicao,
        visualizacoes: data.visualizacoes || 0,
        colecao: collectionName
      });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

export async function incrementArticleViews(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      visualizacoes: increment(1)
    });
  } catch (error) {
    // Fail silently or log, don't block user reading
    console.log("Failed to increment views:", error);
  }
}

// ============================================
// NOTIFICATIONS
// ============================================
export function setupNotificationsListener(userId: string, callback: (notifications: UserNotification[]) => void) {
  const q = query(
    collection(db, "notifications"),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifs: UserNotification[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Client-side filter to ensure security and flexibility
      if (data.userId === userId) {
        notifs.push({
          id: docSnapshot.id,
          userId: data.userId,
          titulo: data.titulo || "Notificação",
          mensagem: data.mensagem || "",
          timestamp: data.timestamp,
          lida: !!data.lida
        });
      }
    });
    callback(notifs);
  }, (error) => {
    console.error("Notifications listener error:", error);
  });
}

export async function markNotificationAsRead(id: string) {
  try {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { lida: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
  }
}

export async function markAllNotificationsAsRead(notifs: UserNotification[]) {
  try {
    const batch = writeBatch(db);
    const unread = notifs.filter(n => !n.lida);
    unread.forEach(n => {
      const docRef = doc(db, "notifications", n.id);
      batch.update(docRef, { lida: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, "notifications");
  }
}
