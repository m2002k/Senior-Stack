// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCijTccIidClhOSiMZM4lCWHEpUt7nTPUQ",
  authDomain: "seniorstack-f8c6f.firebaseapp.com",
  projectId: "seniorstack-f8c6f",
  storageBucket: "seniorstack-f8c6f.firebasestorage.app",
  messagingSenderId: "707369023661",
  appId: "1:707369023661:web:88a6ba97cfd61a8039ae24",
  measurementId: "G-MC41MBY7HY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
