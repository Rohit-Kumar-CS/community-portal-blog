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

// --- FIREBASE INITIALIZATION AREA ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔥 YEH LINE ADD KARO taaki app.js ko Storage ka configuration mil sake
const storage = firebase.storage();


// --- 🚪 ABSOLUTE AUTOMATIC LOGOUT ON TAB/BROWSER CLOSE ---
window.addEventListener('unload', function () {
    // Jaise hi tab ya browser window close hogi, Firebase session tabhi ke tabhi destroy ho jayega
    auth.signOut();
});

// Core DOM Element Selectors
const blogGrid = document.getElementById('blogGrid');
// app.js ke upar check karo jahan selectors hain, aur ye line add/update karo
const searchActionArea = document.getElementById('searchActionArea');
const postModal = document.getElementById('postModal');
const createPostForm = document.getElementById('createPostForm');
const paginationContainer = document.getElementById('paginationContainer');

let allBlogs = [];
let filteredBlogs = [];
const blogsPerPage = 9;
let currentPage = 1;
let currentUserName = "Author";
let quill;


/* 📍 REPLACE POSITION: app.js ke bottom me search logic ke aas-paas ya function scope ke end me */



// Window Loader Sequence Hook
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Write content here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }

    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => postModal.classList.remove('active'));
});

// --- 🌐 DATABASE FETCH & PAGINATION ---
function fetchBlogs() {
    db.collection("blogs").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        allBlogs = [];
        snapshot.forEach((doc) => {
            let blogData = doc.data();
            blogData.id = doc.id;
            allBlogs.push(blogData);
        });

        filteredBlogs = [...allBlogs];
        currentPage = 1;
        renderBlogPaginationEngine();
    });
}

function renderBlogPaginationEngine() {
    if (!blogGrid) return;
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    const currentSlice = filteredBlogs.slice(startIndex, endIndex);

    displayBlogs(currentSlice);
    buildPaginationUI(totalPages);
}

function displayBlogs(blogsArray) {
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

function buildPaginationUI(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";
    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const prevBtn = document.createElement('div');
        prevBtn.className = "page-link-block nav-step-btn";
        prevBtn.innerHTML = "&laquo; Prev";
        prevBtn.addEventListener('click', () => {
            currentPage--;
            renderBlogPaginationEngine();
            window.scrollTo({ top: 350, behavior: 'smooth' });
        });
        paginationContainer.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('div');
            pageBtn.className = `page-link-block ${i === currentPage ? 'active-page' : ''}`;
            pageBtn.innerText = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderBlogPaginationEngine();
                window.scrollTo({ top: 350, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        } else if (i === 2 || i === totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = "page-dots-indicator";
            dots.innerText = "...";
            paginationContainer.appendChild(dots);
        }
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement('div');
        nextBtn.className = "page-link-block nav-step-btn";
        nextBtn.innerHTML = "Next &raquo;";
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderBlogPaginationEngine();
            window.scrollTo({ top: 350, behavior: 'smooth' });
        });
        paginationContainer.appendChild(nextBtn);
    }
}


if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('postTitle').value;
        const image = document.getElementById('postImage').value;
        const content = typeof quill !== 'undefined'
            ? quill.root.innerHTML
            : "";

        // Validation
        if (typeof quill !== 'undefined' &&
            quill.getText().trim().length === 0) {
            alert("Please write some content before publishing!");
            return;
        }

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const date = new Date().toLocaleDateString('en-US', options);

        try {

            const newPost = {
                title: title,
                image: image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
                content: content,
                author: typeof currentUserName !== 'undefined'
                    ? currentUserName
                    : "Anonymous User",
                date: date,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection("blogs").add(newPost);

            alert('Blog Published Successfully!');

            createPostForm.reset();

            if (typeof quill !== 'undefined') {
                quill.setContents([]);
            }

            postModal.classList.remove('active');
            window.location.reload();

        } catch (error) {
            console.error("Submission failed:", error);
            alert("Publishing error: " + error.message);
        }
    });
}
// Search field filtering system
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase().trim();
        filteredBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(text));
        currentPage = 1;
        renderBlogPaginationEngine();
    });
}

fetchBlogs();



