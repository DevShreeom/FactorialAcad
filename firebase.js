import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { CONFIG } from "./config.js";
const app = initializeApp(CONFIG.firebase);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, onAuthStateChanged, firebaseSignOut };