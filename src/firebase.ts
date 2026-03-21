import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1nfzjqwb4nK7rEfIWm5auAy1LElQWIjM",
  authDomain: "ecommerce-app-like-fiverr.firebaseapp.com",
  projectId: "ecommerce-app-like-fiverr",
  storageBucket: "ecommerce-app-like-fiverr.firebasestorage.app",
  messagingSenderId: "339822546512",
  appId: "1:339822546512:web:0e4cdf4dadb40b1f488b55",
  measurementId: "G-JH6JHTLDZK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
