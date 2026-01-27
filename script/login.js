import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

export let workername;

function redirectByUserRole(email) {
  if (email === 'kuchynauhromadov@gmail.com') {
    window.location.href = "kitchen.html";
  } else if (email === 'baruhromadov@gmail.com') {
    window.location.href = "bar.html";
  } else if (email === 'pizzauhromadov@gmail.com') {
    window.location.href = "pizza.html";
  } else if (email === 'tobiaszaniewski@gmail.com') {
    localStorage.setItem('workername', 'Tobias');
    window.location.href = "ordering-page.html";
  } else if (email === 'adamsibik@gmail.com') {
    localStorage.setItem('workername', 'Adam');
    window.location.href = "ordering-page.html";
  } else if (email === 'ninahromadova02@gmail.com') {
    localStorage.setItem('workername', 'Nina');
    window.location.href = "ordering-page.html";
  }
}

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Firebase session persistence nastavená");
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });


window.addEventListener("beforeunload", () => {
  signOut(auth);
});


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Užívateľ je prihlásený:", user.email);
    redirectByUserRole(user.email);
  }
});


loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.innerText = "";

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Prihlásený:", user.email);
      redirectByUserRole(user.email);
    })
    .catch((error) => {
      console.error("Chyba:", error.code, error.message);

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        errorMsg.innerText = "Nesprávny email alebo heslo.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg.innerText = "Príliš veľa pokusov. Skús to neskôr.";
      } else {
        errorMsg.innerText = "Chyba: " + error.message;
      }
    });
});

