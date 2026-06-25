import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkr5p1RAHUqahMCYQ2RVecmE77UiZ0GyU",
  authDomain: "jamalpur-65b5f.firebaseapp.com",
  databaseURL: "https://jamalpur-65b5f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "jamalpur-65b5f",
  storageBucket: "jamalpur-65b5f.firebasestorage.app",
  messagingSenderId: "915414441647",
  appId: "1:915414441647:web:a1fce9382784a0e903fe5a",
  measurementId: "G-E9EC4WSH0W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


