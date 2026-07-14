document.addEventListener("DOMContentLoaded", () => {
    // 1. LocalStorage se save ki hui theme nikalo (Default: dark)
    const currentTheme = localStorage.getItem("theme") || "dark";
    
    // Agar light save hai, toh body par class lagao
    if (currentTheme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

    // 2. Master Navbar Injection (Jo aapne pehle kiya tha)
    let existingHeader = document.querySelector(".navbar-custom") || document.querySelector("header");
    if (existingHeader) {
        existingHeader.className = "navbar-custom";
        existingHeader.innerHTML = `
            <div class="logo-custom" style="cursor: pointer;" onclick="window.location.href='index.html'">SOICT<span> Community</span></div>
            <div class="menu-toggle-custom" id="menuToggleCustom" style="cursor:pointer; color:#fff; font-size:24px; display:none;">☰</div>
            <ul class="nav-links-custom-ul" id="navLinksCustom">
                <li><a href="index.html" class="nav-link-custom-item">Home</a></li>
                   <li><a href="#" class="nav-link-custom-item">Information Technology</a></li>
                <li><a href="team-section.html" class="nav-link-custom-item">Team</a></li>
                <li><a href="#" class="nav-link-custom-item">Events</a></li>
                <li><a href="#" class="nav-link-custom-item">Opportunities</a></li>
                <li><a href="#" class="nav-link-custom-item">Blogs</a></li>
                <li><a href="#" class="nav-link-custom-item">Resources</a></li>
                
                <li id="dynamicAuthArea" class="dynamic-auth-container"></li>
                <li>
                    <button id="globalThemeToggleBtn" style="background:none; border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:600;">
                        ${currentTheme === "light" ? "🌙" : "☀️"}
                    </button>
                </li>
            </ul>
        `;
    }

    // 3. 🔥 Light/Dark Mode Click Event Listener
    const themeBtn = document.getElementById("globalThemeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            // Check karo abhi kaun sa mode chal raha hai
            const isLight = document.body.classList.contains("light-mode");
            
            if (isLight) {
                // Agar pehle se light hai, toh dark kar do
                document.body.classList.remove("light-mode");
                localStorage.setItem("theme", "dark");
                themeBtn.innerHTML = "☀️";
            } else {
                // Agar dark hai, toh light kar do
                document.body.classList.add("light-mode");
                localStorage.setItem("theme", "light");
                themeBtn.innerHTML = "🌙";
            }
        });
    }

    // --- (Baaki ka Firebase Auth code niche jaisa hai waisa hi chhod do) ---

    // --- 🔐 4. AUTOMATIC DYNAMIC FIREBASE AUTH CHECK ---
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            const dynamicAuthArea = document.getElementById('dynamicAuthArea');
            if (!dynamicAuthArea) return;

            if (user) {
                // 🔓 User Logged In State: Name + Logout Button
                const userName = user.displayName || user.email.split('@')[0];
                dynamicAuthArea.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button id="headerLogoutBtn" style="background:#ff4d4d; border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:600; font-size:13px;">Logout</button>
                    </div>
                `;

                // Logout Action Binding
                const logoutBtn = document.getElementById('headerLogoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        firebase.auth().signOut().then(() => {
                            window.location.reload();
                        });
                    });
                }
            } else {
                // 🔒 Guest State: Combined Login & Register Link Buttons
                dynamicAuthArea.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <a href="login.html" class="nav-custom-btn btn-login-custom" style="color: #fff; text-decoration:none; font-weight:600; font-size:14px;">Login</a>
                        <a href="login.html?mode=register" class="nav-custom-btn btn-register-custom" style="background:#007bff; color:white; text-decoration:none; padding:6px 15px; border-radius:20px; font-weight:600; font-size:14px;">Register</a>
                    </div>
                `;
            }
        });
    }

    // Mobile Navbar Responsive Menu Toggle Handler
    const menuToggle = document.getElementById('menuToggleCustom');
    const navLinks = document.getElementById('navLinksCustom');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});




 document.addEventListener('DOMContentLoaded', () => {
            const menuToggleCustom = document.getElementById('menuToggleCustom');
            const navLinksCustom = document.getElementById('navLinksCustom');

            // 1. Mobile Dropdown Engine Trigger
            if (menuToggleCustom && navLinksCustom) {
                menuToggleCustom.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navLinksCustom.classList.toggle('active-show');
                });

                document.addEventListener('click', (e) => {
                    if (!navLinksCustom.contains(e.target) && e.target !== menuToggleCustom) {
                        navLinksCustom.classList.remove('active-show');
                    }
                });
            }

            // 2. Real-Time Firebase Auth Syncer Engine
            if (typeof auth !== 'undefined') {
                auth.onAuthStateChanged((user) => {
                    const dynamicAuthArea = document.getElementById('dynamicAuthArea');
                    const searchAreaCreateBlogContainer = document.getElementById('searchAreaCreateBlogContainer');

                    if (user) {
                        // 🔓 USER LOGGED IN VIEW STATE
                        if (dynamicAuthArea) {
                            dynamicAuthArea.innerHTML = `
                            <button class="nav-custom-btn btn-logout-custom" id="headerLogoutBtn">Logout</button>
                        `;
                        }

                        // Render premium button straight above search engine input box
                        if (searchAreaCreateBlogContainer) {
                            searchAreaCreateBlogContainer.innerHTML = `
                            <button class="nav-custom-btn btn-create-blog" id="headerCreatePostBtn" style="margin-bottom: 5px;">Create Blog</button>
                        `;

                            document.getElementById('headerCreatePostBtn').addEventListener('click', () => {
                                const mainModal = document.getElementById('postModal');
                                if (mainModal) mainModal.classList.add('active');
                            });
                        }

                        // Sign-out action link bind
                        const logoutBtn = document.getElementById('headerLogoutBtn');
                        if (logoutBtn) {
                            logoutBtn.addEventListener('click', () => {
                                auth.signOut().then(() => {
                                    window.location.reload();
                                });
                            });
                        }

                    } else {
                        // 🔒 GUEST LOGGED OUT VIEW STATE
                        if (dynamicAuthArea) {
                            dynamicAuthArea.innerHTML = `
                            <a href="login.html" class="nav-custom-btn btn-login-custom">Login</a>
                            <a href="login.html?mode=register" class="nav-custom-btn btn-register-custom">Register</a>
                        `;
                        }

                        if (searchAreaCreateBlogContainer) {
                            searchAreaCreateBlogContainer.innerHTML = `
                            <p style="color: var(--light-gray, #E0DFE3); font-size: 14px;">Please login to create a new blog post.</p>
                        `;
                        }
                    }
                });
            }
        });