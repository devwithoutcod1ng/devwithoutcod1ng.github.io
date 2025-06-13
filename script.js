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
    try {
        // Pfad zur languages.json relativ zum aktuellen Verzeichnis
        const path = window.location.pathname.includes('/projects/tendies-archive/') ? '../../languages.json' : 'languages.json';
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load translations: ${res.status} ${res.statusText}`);
        }
        translations = await res.json();
        setLanguage(currentLang);
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback zu den Standardtexten
        translations = {
            'tendies.hero.title.en': 'fel1x.',
            'tendies.hero.title.de': 'fel1x.',
            'tendies.hero.subtitle.en': '.tendies Archive',
            'tendies.hero.subtitle.de': '.tendies Archiv',
            'tendies.hero.scroll.en': 'Scroll to <strong>Tendies</strong>',
            'tendies.hero.scroll.de': 'Zu den <strong>Tendies</strong>',
            'nav.home.en': 'Home',
            'nav.home.de': 'Startseite',
            'nav.projects.en': 'Projects',
            'nav.projects.de': 'Projekte'
        };
        setLanguage(currentLang);
    }
}

function t(key) {
    const translation = translations[`${key}.${currentLang}`];
    if (!translation) {
        console.warn(`Missing translation for key: ${key}.${currentLang}`);
        return translations[`${key}.en`] || key; // Fallback auf Englisch oder den Schlüssel selbst
    }
    return translation;
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

    // Hero - Unterscheidung zwischen Home, Projects und Tendies Archive Seite
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        if (window.location.pathname.includes('/projects/tendies-archive/')) {
            heroTitle.innerHTML = t('tendies.hero.title');
        } else if (window.location.pathname === '/projects.html') {
            heroTitle.innerHTML = t('projects.hero.title');
        } else {
            heroTitle.innerHTML = t('home.hero.name');
        }
    }

    const heroSubtitle = document.querySelector('.hero-content .subtitle');
    if (heroSubtitle) {
        if (window.location.pathname.includes('/projects/tendies-archive/')) {
            heroSubtitle.textContent = t('tendies.hero.subtitle');
        } else if (window.location.pathname === '/projects.html') {
            heroSubtitle.textContent = t('projects.hero.subtitle');
        } else {
            heroSubtitle.textContent = t('home.hero.subtitle');
        }
    }

    const projectsBtn = document.querySelector('.cta-buttons .btn.primary');
    if (projectsBtn) projectsBtn.textContent = t('home.hero.projects_btn');

    const scrollIndicator = document.querySelector('.scroll-indicator span');
    if (scrollIndicator) {
        if (window.location.pathname.includes('/projects/tendies-archive/')) {
            scrollIndicator.innerHTML = t('tendies.hero.scroll');
        } else if (window.location.pathname === '/projects.html') {
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
                        <a href="${project.viewUrl}" class="btn primary">View Project</a>
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

// Tendies Archive Funktionalität
async function loadTendiesData() {
    if (!window.location.pathname.includes('/projects/tendies-archive/')) {
        return; // Nur auf der Tendies-Archive-Seite ausführen
    }

    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`./tendies.json?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const grid = document.getElementById('tendies-grid');
        
        if (!grid) {
            throw new Error('Grid element not found');
        }

        if (!data.tendies || !Array.isArray(data.tendies)) {
            throw new Error('Invalid tendies data format');
        }

        // Grid leeren vor dem Hinzufügen neuer Karten
        grid.innerHTML = '';

        data.tendies.forEach(tendies => {
            const card = document.createElement('div');
            card.className = 'tendies-card';
            
            // Video-Container
            const videoContainer = document.createElement('div');
            videoContainer.className = 'tendies-video';
            
            const video = document.createElement('video');
            video.src = `${tendies.videoPath}?t=${timestamp}`;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            
            videoContainer.appendChild(video);
            
            // Titel
            const title = document.createElement('h3');
            title.className = 'tendies-title';
            title.textContent = tendies.name;
            
            // Download-Button
            const downloadLink = document.createElement('a');
            downloadLink.href = `${tendies.downloadLink}?t=${timestamp}`;
            downloadLink.className = 'tendies-download';
            downloadLink.download = true;
            downloadLink.innerHTML = '<i class="fas fa-download"></i> Download';
            
            // Elemente zur Karte hinzufügen
            card.appendChild(videoContainer);
            card.appendChild(title);
            card.appendChild(downloadLink);
            
            // Video-Playback beim Hover
            card.addEventListener('mouseenter', () => {
                video.play().catch(error => console.log('Video playback failed:', error));
            });
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading tendies:', error);
        const grid = document.getElementById('tendies-grid');
        if (grid) {
            grid.innerHTML = `
                <div style="text-align: center; color: var(--text-color); padding: 2rem;">
                    <p>Fehler beim Laden der Tendies: ${error.message}</p>
                    <p>Bitte versuchen Sie es später erneut.</p>
                    <button onclick="loadTendiesData()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Erneut versuchen
                    </button>
                </div>
            `;
        }
    }
}

// Event Listener für Seitenaufruf
document.addEventListener('DOMContentLoaded', () => {
    // Bestehende DOMContentLoaded Funktionalität
    loadTranslations();
    
    // Tendies-Daten laden
    loadTendiesData();
});

// Event Listener für Seitenwechsel
window.addEventListener('popstate', loadTendiesData); 