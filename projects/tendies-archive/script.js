let isLoading = false;
let lastLoadTime = 0;
const MIN_LOAD_INTERVAL = 1000; // Mindestens 1 Sekunde zwischen Ladevorgängen

function displayTendies(tendies) {
    console.log('Starte displayTendies mit', tendies.length, 'Tendies');
    const container = document.querySelector('.tendies-grid');
    
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    if (!Array.isArray(tendies) || tendies.length === 0) {
        console.error('Keine gültigen Tendies zum Anzeigen');
        container.innerHTML = '<div class="error"><p>Keine Tendies gefunden</p></div>';
        return;
    }

    try {
        const html = tendies.map(tendie => {
            const date = new Date(tendie.date).toLocaleDateString('de-DE');
            return `
                <div class="tendie-card">
                    <img src="${tendie.image}" alt="${tendie.title}" loading="lazy">
                    <div class="tendie-info">
                        <h3>${tendie.title}</h3>
                        <p class="date">${date}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('Tendies erfolgreich angezeigt');
    } catch (error) {
        console.error('Fehler beim Anzeigen der Tendies:', error);
        container.innerHTML = '<div class="error"><p>Fehler beim Anzeigen der Tendies</p></div>';
    }
}

async function loadTendies() {
    const now = Date.now();
    if (isLoading || (now - lastLoadTime) < MIN_LOAD_INTERVAL) {
        console.log('Ladevorgang läuft bereits oder zu schnell hintereinander, überspringe...');
        return;
    }

    const container = document.querySelector('.tendies-grid');
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    try {
        isLoading = true;
        lastLoadTime = now;
        console.log('Starte Laden der Tendies...');
        
        container.innerHTML = '<div class="loading">Lade Tendies...</div>';
        
        const response = await fetch('projects/tendies-archive/tendies.json', {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Tendies geladen:', data);
        
        if (!data || !Array.isArray(data.tendies)) {
            throw new Error('Ungültiges Datenformat in tendies.json');
        }
        
        // Sortiere nach Datum (neueste zuerst)
        const sortedTendies = [...data.tendies].sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sortierte Tendies:', sortedTendies.length);
        
        // Zeige die Tendies an
        displayTendies(sortedTendies);
    } catch (error) {
        console.error('Fehler beim Laden der Tendies:', error);
        if (container) {
            container.innerHTML = '<div class="error"><p>Fehler beim Laden der Tendies. Bitte versuche es später erneut.</p></div>';
        }
    } finally {
        isLoading = false;
    }
}

// Warte auf vollständiges Laden des DOM
function initializeTendies() {
    console.log('Initialisiere Tendies...');
    const container = document.querySelector('.tendies-grid');
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden, versuche es später erneut...');
        setTimeout(initializeTendies, 1000);
        return;
    }
    
    console.log('Container gefunden, starte initiales Laden...');
    // Verzögere das initiale Laden um 500ms
    setTimeout(loadTendies, 500);
}

// Starte die Initialisierung wenn das DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTendies);
} else {
    initializeTendies();
}

// Lade die Tendies alle 5 Sekunden neu, aber nur wenn die Seite sichtbar ist
let reloadInterval;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (reloadInterval) {
            clearInterval(reloadInterval);
            reloadInterval = null;
        }
    } else {
        // Verzögere das Laden um 500ms wenn die Seite wieder sichtbar wird
        setTimeout(() => {
            loadTendies();
            reloadInterval = setInterval(loadTendies, 5000);
        }, 500);
    }
});

// Initiales Intervall setzen
reloadInterval = setInterval(loadTendies, 5000);

// Event Listener für die Filter-Buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Entferne active Klasse von allen Buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Füge active Klasse zum geklickten Button hinzu
            button.classList.add('active');
            // Lade die Tendies neu
            loadTendies();
        });
    });
});

// Hilfsfunktionen für Dateityp-Erkennung
function isVideoFile(filename) {
    if (!filename) return false;
    const videoExtensions = ['mp4', 'mov', 'webm'];
    const extension = filename.toLowerCase();
    return videoExtensions.includes(extension);
}

function isImageFile(filename) {
    if (!filename) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const extension = filename.toLowerCase();
    return imageExtensions.includes(extension);
} 