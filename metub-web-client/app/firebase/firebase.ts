// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9hf2bDk6voNVwpNEhIyvMI5FOx7rYUys",
  authDomain: "metub-59dd9.firebaseapp.com",
  projectId: "metub-59dd9",
  appId: "1:849520744514:web:04e82eeb4206638cc035db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
export const functions = getFunctions();

export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider())
}

export function signOut() {
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback:(user:User | null) => void) {
    return onAuthStateChanged(auth, callback)
}