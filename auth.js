// --- FIREBASE CONFIGURATION (ROHIT'S REAL CONFIG) ---
const firebaseConfig = {
    apiKey: "AIzaSyDjNWBilhKpj8RNHjsC5MDXy-ep-Xbs7GQ",
    authDomain: "community-portal-blog.firebaseapp.com",
    projectId: "community-portal-blog",
    storageBucket: "community-portal-blog.firebasestorage.app",
    messagingSenderId: "1023990335036",
    appId: "1:1023990335036:web:1d03b00147d61a0feea539",
    measurementId: "G-N03RZX09YH"
};

// Firebase Initialize
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 1. REGISTER LOGIC ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Firebase Auth se naya user create karein
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // User register ho gya, ab uska naam database me save karein
                return db.collection("users").doc(userCredential.user.uid).set({
                    name: name,
                    email: email
                });
            })
            .then(() => {
                alert('Registration Successful! Please login now.');
                window.location.href = 'login.html';
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}

// --- 2. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Firebase Auth se login check karein
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert('Login Successful!');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}

// --- 3. FORGOT PASSWORD LOGIC (ENGLISH VERSION) ---
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Prompt user for their registered email
        const email = prompt("Please enter your registered Email ID:");
        
        if (!email) {
            alert("Email is required to reset password!");
            return;
        }

        // Firebase command to send password reset email
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("A password reset link has been sent to your email. Please check your Inbox or Spam folder!");
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}