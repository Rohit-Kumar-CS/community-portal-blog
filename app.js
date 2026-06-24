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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const navLinks = document.getElementById('navLinks');
const searchBar = document.getElementById('searchBar');
const postModal = document.getElementById('postModal');
const createPostForm = document.getElementById('createPostForm');

let allBlogs = []; // Saare blogs store karne ke liye global array
let currentUserName = "Guest";
let quill; // Quill global variable setup

// --- QUILL TEXT EDITOR INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Write your rich content here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
});

// --- 1. AUTH STATE CHECK (Navbar Update) ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // User logged in hai, uska naam Firestore se nikaalein
        db.collection("users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                currentUserName = doc.data().name;
            }
            navLinks.innerHTML = `
                <span class="welcome-user">Hi, ${currentUserName}</span>
                <button class="nav-btn create-btn" id="openModalBtn">Create Post</button>
                <button class="nav-btn logout-btn" id="logoutBtn">Logout</button>
            `;
            
            // Event Listeners for dynamic buttons
            document.getElementById('openModalBtn').addEventListener('click', () => postModal.classList.add('active'));
            document.getElementById('logoutBtn').addEventListener('click', () => {
                auth.signOut().then(() => {
                    alert("Logged out!");
                    window.location.reload();
                });
            });
        });
    } else {
        navLinks.innerHTML = `<a href="login.html" class="nav-btn login-nav-btn">Login / Register</a>`;
    }
});

// --- 2. FETCH & DISPLAY BLOGS FROM FIRESTORE ---
function fetchBlogs() {
    // Firestore se blogs collection load karein (newest first)
    db.collection("blogs").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        allBlogs = [];
        snapshot.forEach((doc) => {
            let blogData = doc.data();
            blogData.id = doc.id; // Document ki unique ID save karein detail page ke liye
            allBlogs.push(blogData);
        });
        displayBlogs(allBlogs);
    });
}

function displayBlogs(blogsArray) {
    blogGrid.innerHTML = "";
    if (blogsArray.length === 0) {
        blogGrid.innerHTML = `<p class="no-blogs">No blogs found.</p>`;
        return;
    }

    blogsArray.forEach((blog) => {
        // Home page card strip ke liye HTML tags ko remove karke clean preview text banana
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blog.content;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";

        const card = document.createElement('article');
        card.classList.add('blog-card');
        card.innerHTML = `
            <a href="blog-detail.html?id=${blog.id}" style="text-decoration: none; color: inherit;">
                <img src="${blog.image}" alt="${blog.title}" class="blog-img">
                <div class="blog-card-body">
                    <h2 class="blog-card-title">${blog.title}</h2>
                    <p class="blog-card-text">${cleanText.substring(0, 120)}...</p>
                    <div class="blog-meta">
                        <span>By ${blog.author}</span>
                        <span>${blog.date}</span>
                    </div>
                </div>
            </a>
        `;
        blogGrid.appendChild(card);
    });
}

// --- 3. CREATE NEW BLOG TO FIRESTORE ---
if (createPostForm) {
    createPostForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('postTitle').value;
        const image = document.getElementById('postImage').value;
        
        // Quill editor se full HTML formatted block extraction
        const content = quill.root.innerHTML; 

        // Ek validation check ki editor khali toh nahi hai
        if (quill.getText().trim().length === 0) {
            alert("Please write some content before publishing!");
            return;
        }
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date().toLocaleDateString('en-US', options);

        const newPost = {
            title: title,
            image: image,
            content: content,
            author: currentUserName,
            date: date,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // Sahi ordering ke liye timestamp
        };

        // Firestore me data push karein
        db.collection("blogs").add(newPost)
            .then(() => {
                alert('Blog Published Online with Rich Formatting!');
                createPostForm.reset();
                quill.setContents([]); // Submit hone ke baad editor clear karna
                postModal.classList.remove('active');
            })
            .catch((error) => alert("Error: " + error.message));
    });
}

// Search Filter
searchBar.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    const filtered = allBlogs.filter(blog => blog.title.toLowerCase().includes(text));
    displayBlogs(filtered);
});

// Close modal code
document.getElementById('closeModalBtn').addEventListener('click', () => postModal.classList.remove('active'));

// Load blogs on start
fetchBlogs();