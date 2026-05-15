import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAYZ0IvidFdhrfaEeG4Y2w9M50NtWMvBFU",
  authDomain: "assignment-portal-a11f7.firebaseapp.com",
  projectId: "assignment-portal-a11f7",
  storageBucket: "assignment-portal-a11f7.firebasestorage.app",
  messagingSenderId: "186376623641",
  appId: "1:186376623641:web:bf7d23f976440f2aac7c88",
  measurementId: "G-94GJR6LRP7"
};

// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================
// TAB SWITCHING
// =========================
window.showTab = function(tab) {
  document.getElementById('loginForm').style.display =
    tab === 'login' ? 'block' : 'none';

  document.getElementById('registerForm').style.display =
    tab === 'register' ? 'block' : 'none';

  document.getElementById('loginTab').className =
    tab === 'login' ? 'active' : '';

  document.getElementById('registerTab').className =
    tab === 'register' ? 'active' : '';

  // CLEAR MESSAGES
  document.getElementById('loginMsg').textContent = '';
  document.getElementById('registerMsg').textContent = '';
}

// =========================
// REGISTER USER
// =========================
window.registerUser = async function() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const role = document.getElementById('regRole').value;

  const msg = document.getElementById('registerMsg');

  // VALIDATION
  if (!name || !email || !password || !role) {
    msg.style.color = 'red';
    msg.textContent = '⚠️ Please fill all fields!';
    return;
  }

  try {
    // CREATE USER
    const userCred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    // SAVE USER DATA
    await setDoc(
      doc(db, "users", userCred.user.uid),
      {
        name: name,
        email: email,
        role: role
      }
    );

    msg.style.color = 'green';
    msg.textContent =
      '✅ Registered successfully! Redirecting to login...';

    // CLEAR REGISTER FORM
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regRole').value = '';

    // IMPORTANT FIX
    // FIREBASE AUTO LOGS IN AFTER REGISTER
    // SO WE SIGN OUT
    await signOut(auth);

    // SWITCH TO LOGIN TAB
    setTimeout(() => {
      showTab('login');
    }, 1000);
  }
  catch (err) {
    msg.style.color = 'red';

    if (err.code === 'auth/email-already-in-use') {
      msg.textContent = '❌ Email already exists!';
    }
    else if (err.code === 'auth/weak-password') {
      msg.textContent = '❌ Password should be at least 6 characters!';
    }
    else {
      msg.textContent = '❌ ' + err.message;
    }
  }
}

// =========================
// LOGIN USER
// =========================
window.loginUser = async function() {
  const email =
    document.getElementById('loginEmail').value.trim();

  const password =
    document.getElementById('loginPassword').value.trim();

  const role =
    document.getElementById('loginRole').value;

  const msg =
    document.getElementById('loginMsg');

  // VALIDATION
  if (!email || !password || !role) {
    msg.style.color = 'red';
    msg.textContent =
      '⚠️ Please enter email, password, and select a role!';
    return;
  }

  try {
    // LOGIN
    const userCred =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // GET USER ROLE
    const userDoc =
      await getDoc(
        doc(db, "users", userCred.user.uid)
      );

    // CHECK USER EXISTS
    if (!userDoc.exists()) {
      msg.style.color = 'red';
      msg.textContent = '❌ User data not found!';
      return;
    }

    const dbRole = userDoc.data().role;

    if (role !== dbRole) {
      msg.style.color = 'red';
      msg.textContent = '❌ Selected role does not match your account role!';
      return;
    }

    msg.style.color = 'green';
    msg.textContent = '✅ Login successful!';

    // CLEAR FORM
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginRole').value = '';

    // REDIRECT
    setTimeout(() => {
      if (role === 'faculty') {
        window.location.href = 'faculty.html';
      } else {
        window.location.href = 'student.html';
      }
    }, 1000);
  }
  catch (err) {
    msg.style.color = 'red';

    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found'
    ) {
      msg.textContent =
        '❌ Invalid email or password!';
    }
    else {
      msg.textContent =
        '❌ ' + err.message;
    }
  }
}
