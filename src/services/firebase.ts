// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "al-shafii-academy",
  "appId": "1:511272227449:web:ffd5cf84cbe344b88f3aa8",
  "storageBucket": "al-shafii-academy.firebasestorage.app",
  "apiKey": "AIzaSyDNA-36d2oodnW9SlreYjmaI_cuDqZzqBI",
  "authDomain": "al-shafii-academy.firebaseapp.com",
  "messagingSenderId": "511272227449"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
