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

// Browser close karne par automatic logout script (Persistence Layer)
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .catch((error) => {
        console.error("Persistence implementation error:", error.message);
    });

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const navLinks = document.getElementById('navLinks');
const searchBar = document.getElementById('searchBar');
const postModal = document.getElementById('postModal');
const createPostForm = document.getElementById('createPostForm');
const closeModalBtn = document.getElementById('closeModalBtn');

let allBlogs = []; 
let currentUserName = "Anonymous";
let quill; 

// --- AUTH STATE MONITOR ENGINE ---
auth.onAuthStateChanged((user) => {
    const toggleButtonHTML = `
        <button id="theme-toggle" class="theme-btn">
            <span class="mode-icon">${document.body.classList.contains('light-mode') ? '🌙' : '☀️'}</span>
        </button>
    `;

    if (user) {
        // 1. User Logged In: Create Post button dikhega, Login button aur Manual Logout hat jayega
        db.collection("users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                currentUserName = doc.data().name || "Author";
            }
            
            navLinks.innerHTML = `
                <button class="nav-btn create-btn" id="openModalBtn">Create Post</button>
                <span class="welcome-user" style="color: var(--white); font-weight:600;">Hi, ${currentUserName}</span>
                ${toggleButtonHTML}
            `;
            
            // Listeners attach karein dynamic injection ke baad
            setupThemeToggleListener();
            document.getElementById('openModalBtn').addEventListener('click', () => postModal.classList.add('active'));
        });
    } else {
        // 2. User Logged Out / Guest: Sirf Login / Register aur Mode Switcher dikhega
        navLinks.innerHTML = `
            <a href="login.html" class="nav-btn login-nav-btn" id="authBtn">Login / Register</a>
            ${toggleButtonHTML}
        `;
        setupThemeToggleListener();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Quill Rich Text Editor Setup
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Write your content here...',
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

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => postModal.classList.remove('active'));
});

// Theme Selector Control Listener Function
function setupThemeToggleListener() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const modeIcon = themeToggleBtn.querySelector('.mode-icon');
            if (document.body.classList.contains('light-mode')) {
                modeIcon.textContent = '🌙';
            } else {
                modeIcon.textContent = '☀️';
            }
        });
    }
}

// --- FETCH & DISPLAY DATA STREAMS ---
function fetchBlogs() {
    db.collection("blogs").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        allBlogs = [];
        snapshot.forEach((doc) => {
            let blogData = doc.data();
            blogData.id = doc.id;
            allBlogs.push(blogData);
        });
        displayBlogs(allBlogs);
    });
}

function displayBlogs(blogsArray) {
    if (!blogGrid) return;
    blogGrid.innerHTML = "";
    
    if (blogsArray.length === 0) {
        blogGrid.innerHTML = `<p class="no-blogs">No blogs found.</p>`;
        return;
    }

    blogsArray.forEach((blog) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blog.content;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";

        const card = document.createElement('article');
        card.classList.add('blog-card');
        card.innerHTML = `
            <a href="blog-detail.html?id=${blog.id}" style="text-decoration: none; color: inherit;">
                <img src="${blog.image}" alt="${blog.title}" class="blog-img" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                <div class="blog-card-overlay">
                    <h2 class="blog-card-title">
                        ${blog.title} 
                        <span class="verified-badge">✓</span>
                    </h2>
                    <p class="blog-card-text">${cleanText.substring(0, 75)}...</p>
                    <div class="blog-meta">
                        <span>By ${blog.author || 'Anonymous'}</span>
                        <span>${blog.date}</span>
                    </div>
                </div>
            </a>
        `;
        blogGrid.appendChild(card);
    });
}

// --- SUBMIT COMPONENT GENERATION ---
if (createPostForm) {
    createPostForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('postTitle').value;
        const image = document.getElementById('postImage').value;
        const content = quill.root.innerHTML; 

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
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection("blogs").add(newPost)
            .then(() => {
                alert('Blog Published Successfully!');
                createPostForm.reset();
                quill.setContents([]);
                postModal.classList.remove('active');
            })
            .catch((error) => alert("Error: " + error.message));
    });
}

// Search Filter Trigger
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase().trim();
        const filtered = allBlogs.filter(blog => blog.title.toLowerCase().includes(text));
        displayBlogs(filtered);
    });
}

// Run Fetch Data Stream
fetchBlogs();