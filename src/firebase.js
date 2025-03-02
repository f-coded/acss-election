// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyC0aP9-G9w-SsVeBIyOxxZEqMIqtHkTg9I",
    authDomain: "acss-election.firebaseapp.com",
    projectId: "acss-election",
    storageBucket: "acss-election.firebasestorage.app",
    messagingSenderId: "409244734597",
    appId: "1:409244734597:web:aae0c4bcb3043cc64545ec"
  };
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
