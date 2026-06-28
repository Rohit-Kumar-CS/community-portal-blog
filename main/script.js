document.addEventListener('DOMContentLoaded', () => {
    // Select Elements For Drawer Manipulation
    const siteHeader = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const closeDrawer = document.getElementById('closeDrawer');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    // STICKY HEADER INTERACTION ON SCROLL
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    });


    // RESPONSIVE SIDE DRAWER FUNCTIONAL CONTROL

    function openDrawer() {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock main visual viewport scroll
        closeDrawer.focus(); // Focus Trap Start Hook
    }

    function closeDrawerMenu() {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Unlock viewport scroll
        menuToggle.focus();
    }

    // Interactive Action Triggers
    menuToggle.addEventListener('click', openDrawer);
    closeDrawer.addEventListener('click', closeDrawerMenu);
    drawerOverlay.addEventListener('click', closeDrawerMenu);

    // Auto Collapse Setup for Single Page Interaction Flow
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            closeDrawerMenu();
        });
    });

    // Close on Hardware or Software Escape Key Press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
            closeDrawerMenu();
        }
    });
});


    // LIGHT & DARK THEME CONTROLLER ENGINE

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Pahle se user ka choice check karega (Local Storage save memory state)
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    themeToggleBtn.addEventListener('click', () => {
        // Toggle engine activate
        document.body.classList.toggle('light-mode');
        
        // Memory state track system setup
        let theme = 'dark';
        if (document.body.classList.contains('light-mode')) {
            theme = 'light';
        }
        localStorage.setItem('theme', theme); // State lock saved on browser re-loads
    });