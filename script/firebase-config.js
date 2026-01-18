import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUfQ0Rb4uRGxj762Pnnhrtr2PyVET5-Os",
  authDomain: "uhromadovpos.firebaseapp.com",
  projectId: "uhromadovpos",
  storageBucket: "uhromadovpos.firebasestorage.app",
  messagingSenderId: "601224526040",
  appId: "1:601224526040:web:58598cb344850481c03fad",
  measurementId: "G-6YK4SMM2GK"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };

console.log("🔥 Firebase úspešne inicializovaný");
