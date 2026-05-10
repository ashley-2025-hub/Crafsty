import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDuQmK13GmmTLFu09GVSghOXjPLJTvS7c",
  authDomain: "crafsty.firebaseapp.com",
  projectId: "crafsty",
  storageBucket: "crafsty.firebasestorage.app",
  messagingSenderId: "147789746977",
  appId: "1:147789746977:web:307f39520d85f242c56460",
  measurementId: "G-CPPGL2H68W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
