console.log('script.js loaded!');

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme based on system preference
document.documentElement.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Header Visibility
const header = document.querySelector('header');
const heroSection = document.querySelector('.hero');
const heroHeight = heroSection ? heroSection.offsetHeight : 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Show/hide header based on scroll position
    if (currentScroll > heroHeight * 0.1) {
        header.classList.add('visible');
    } else {
        header.classList.remove('visible');
    }
});

// Smooth Scrolling für Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = header.offsetHeight;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Fade-in Animation für Sections
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-out');
    observer.observe(section);
});

// Dynamisches Jahr im Footer
const yearEl = document.getElementById('current-year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Parallax Effect für Floating Shapes
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.1;
        const x = (mouseX - 0.5) * speed * 100;
        const y = (mouseY - 0.5) * speed * 100;
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Sprachumschaltung
const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'en';
let translations = {};

async function loadTranslations() {
    const res = await fetch('languages.json');
    translations = await res.json();
    setLanguage(currentLang);
}

function t(key) {
    return translations[`${key}.${currentLang}`] || '';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks.length >= 2) {
        navLinks[0].textContent = t('nav.home');
        navLinks[1].textContent = t('nav.projects');
    }

    // Hero - Unterscheidung zwischen Home und Projects Seite
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        if (window.location.pathname === '/projects.html') {
            heroTitle.innerHTML = t('projects.hero.title');
        } else {
            heroTitle.innerHTML = t('home.hero.name');
        }
    }

    const heroSubtitle = document.querySelector('.hero-content .subtitle');
    if (heroSubtitle) {
        if (window.location.pathname === '/projects.html') {
            heroSubtitle.textContent = t('projects.hero.subtitle');
        } else {
            heroSubtitle.textContent = t('home.hero.subtitle');
        }
    }

    const projectsBtn = document.querySelector('.cta-buttons .btn.primary');
    if (projectsBtn) projectsBtn.textContent = t('home.hero.projects_btn');

    const scrollIndicator = document.querySelector('.scroll-indicator span');
    if (scrollIndicator) {
        if (window.location.pathname === '/projects.html') {
            scrollIndicator.innerHTML = t('projects.hero.scroll');
        } else {
            scrollIndicator.innerHTML = t('home.hero.scroll');
        }
    }

    // About
    const aboutTitle = document.querySelector('.about-card h2');
    if (aboutTitle) aboutTitle.textContent = t('about.title');
    const aboutText = document.querySelector('.about-card .about-text');
    if (aboutText) {
        aboutText.innerHTML = `
            <p>${t('about.greeting')}</p>
            <p>${t('about.desc1')}</p>
            <p>${t('about.desc2')}</p>
        `;
    }
    // Projekte
    renderProjects();
}

if (langToggle) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'de' : 'en';
        setLanguage(newLang);
    });
}

// Initialisierung
loadTranslations().then(renderProjects);

// Dynamische Projekte laden
async function renderProjects() {
    console.log('renderProjects function called');
    const list = document.getElementById('projects-list');
    if (!list) {
        console.log('projects-list element not found, returning');
        return; // Nur rendern, wenn auf der Projekte-Seite
    }

    try {
        // Cache-Busting für projects.json
        const cacheBuster = new Date().getTime();
        console.log('Fetching projects.json');
        const res = await fetch(`projects/projects.json?t=${cacheBuster}`);
        if (!res.ok) {
            console.error('Failed to fetch projects.json', res.status, res.statusText);
            list.innerHTML = '<p>Failed to load projects. Please try again later.</p>';
            return;
        }
        const projects = await res.json();
        console.log('projects.json fetched and parsed', projects);

        list.innerHTML = ''; // Vorherigen Inhalt löschen

        if (projects.length === 0) {
            list.innerHTML = '<p>No projects to display.</p>';
            return;
        }

        projects.forEach(project => {
            const title = project.title[currentLang] || project.title['en'];
            const desc = project.description[currentLang] || project.description['en'];
            const tags = project.tags.map(tag => `<span>${tag}</span>`).join(' ');
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-content">
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <div class="project-tags">${tags}</div>
                    <div class="project-links">
                        <a href="${project.viewUrl}" class="btn primary" target="_blank">View Project</a>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        console.error('Error rendering projects:', error);
        list.innerHTML = '<p>An error occurred while rendering projects. Please check the console for details.</p>';
    }
}

// Immer beim Laden nach oben scrollen
window.onload = () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 50);
}; 