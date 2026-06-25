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

// --- MATRIX UI TOGGLE CONTEXT MANAGER ---
const switchAuthStateBtn = document.getElementById('switchAuthStateBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const toggleText = document.getElementById('toggleText');
const authCoreForm = document.getElementById('authCoreForm');
const dynamicNameGroup = document.getElementById('dynamicNameGroup');

let isLoginMode = true; // State Controller (Default: Login View)

if (switchAuthStateBtn) {
    switchAuthStateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;

        if (!isLoginMode) {
            // Switch UI state to Register
            formTitle.textContent = "Register";
            submitBtn.textContent = "Sign up";
            toggleText.textContent = "Already have an account?";
            switchAuthStateBtn.textContent = "Login";
            
            // Registration mode me dynamic Name input insert karein
            if (!document.getElementById('authNameGroup')) {
                const nameFieldHTML = `
                    <div class="matrix-input-group" id="authNameGroup" style="opacity: 0; transform: translateY(-8px); transition: all 0.3s ease;">
                        <label for="authName">Full Name</label>
                        <div class="input-field-wrapper">
                            <span class="field-icon">👤</span>
                            <input type="text" id="authName" placeholder="Your Name" required>
                        </div>
                    </div>
                `;
                formTitle.insertAdjacentHTML('afterend', nameFieldHTML);
                
                // Smooth fade-in presentation delay trigger
                setTimeout(() => {
                    const group = document.getElementById('authNameGroup');
                    if (group) { group.style.opacity = "1"; group.style.transform = "translateY(0)"; }
                }, 20);
            }
        } else {
            // Switch UI state back to Login
            formTitle.textContent = "Login";
            submitBtn.textContent = "Login";
            toggleText.textContent = "Don't have an account?";
            switchAuthStateBtn.textContent = "Sign up";
            
            // Name input ko clear karein login view ke liye
            const nameField = document.getElementById('authNameGroup');
            if (nameField) {
                nameField.remove();
            }
        }
    });
}

// --- CENTRAL CORE AUTHENTICATION ROUTER ---
if (authCoreForm) {
    authCoreForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        if (isLoginMode) {
            // --- 1. RUN LOGIN FLOW ---
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert('Login Successful!');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                });
        } else {
            // --- 2. RUN REGISTER FLOW ---
            const name = document.getElementById('authName').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Firestore cloud records database syncing sequence
                    return db.collection("users").doc(userCredential.user.uid).set({
                        name: name,
                        email: email
                    });
                })
                .then(() => {
                    alert('Registration Successful! Switching you to login view.');
                    // User environment clear out aur standard login context par dynamic swap render karein
                    isLoginMode = true;
                    formTitle.textContent = "Login";
                    submitBtn.textContent = "Login";
                    toggleText.textContent = "Don't have an account?";
                    switchAuthStateBtn.textContent = "Sign up";
                    const nameField = document.getElementById('authNameGroup');
                    if (nameField) nameField.remove();
                    authCoreForm.reset();
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                });
        }
    });
}

// --- 3. FORGOT PASSWORD SYSTEM ---
// Matrix footer UI container me static anchor target create karne ke liye append functionality
setTimeout(() => {
    const toggleFooter = document.querySelector('.matrix-toggle-footer');
    if (toggleFooter) {
        const forgotLinkHTML = `<br><a href="#" id="matrixForgotBtn" style="display:inline-block; margin-top:10px; font-size:11.5px; opacity:0.8;">Forgot Password?</a>`;
        toggleFooter.insertAdjacentHTML('afterend', forgotLinkHTML);

        document.getElementById('matrixForgotBtn').addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt("Please enter your registered Email ID:");
            
            if (!email) {
                alert("Email is required to reset password!");
                return;
            }

            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert("A password reset link has been sent to your email. Please check your Inbox or Spam folder!");
                })
                .catch((error) => {
                    alert("Error: " + error.message);
                });
        });
    }
}, 500);


