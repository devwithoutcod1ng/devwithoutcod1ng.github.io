let isLoading = false;
let currentLoadPromise = null;

// Cache löschen und Seite neu laden
async function clearCacheAndReload() {
    console.log('Lösche Cache...');
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Cache erfolgreich gelöscht');
        } catch (error) {
            console.error('Fehler beim Löschen des Caches:', error);
        }
    }
}

function displayTendies(tendies) {
    console.log('displayTendies aufgerufen mit', tendies);
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
        console.log('Beginne Rendering der Tendies...');
        const html = tendies.map(tendie => {
            console.log('Verarbeite Tendie:', tendie);
            const date = new Date(tendie.date).toLocaleDateString('de-DE');
            const mediaPath = tendie.image ? tendie.image.replace(/\/+/g, '/') : '';
            return `
                <div class="tendie-card">
                    <img src="${mediaPath}?t=${Date.now()}" alt="${tendie.title}" loading="lazy">
                    <div class="tendie-info">
                        <h3>${tendie.title}</h3>
                        <p class="date">${date}</p>
                    </div>
                </div>
            `;
        }).join('');

        console.log('HTML generiert, füge in Container ein...');
        container.innerHTML = html;
        console.log('Tendies erfolgreich angezeigt');
    } catch (error) {
        console.error('Fehler beim Anzeigen der Tendies:', error);
        container.innerHTML = '<div class="error"><p>Fehler beim Anzeigen der Tendies</p></div>';
    }
}

async function loadTendies() {
    console.log('loadTendies aufgerufen');
    const container = document.querySelector('.tendies-grid');
    
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    try {
        console.log('Starte Laden der Tendies...');
        container.innerHTML = '<div class="loading">Lade Tendies...</div>';
        
        console.log('Fetching tendies.json...');
        const response = await fetch(`tendies.json?t=${Date.now()}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Response erhalten, parse JSON...');
        const data = await response.json();
        console.log('JSON geparst:', data);
        
        if (!data || !Array.isArray(data.tendies)) {
            console.error('Ungültiges Datenformat:', data);
            throw new Error('Ungültiges Datenformat in tendies.json');
        }
        
        console.log('Sortiere Tendies...');
        const sortedTendies = [...data.tendies].sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sortierte Tendies:', sortedTendies);
        
        console.log('Rufe displayTendies auf...');
        displayTendies(sortedTendies);
    } catch (error) {
        console.error('Fehler beim Laden der Tendies:', error);
        if (container) {
            container.innerHTML = `
                <div class="error">
                    <p>Fehler beim Laden der Tendies. Bitte versuche es später erneut.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    }
}

// Initialisierung
async function initialize() {
    console.log('Initialisiere Seite...');
    await clearCacheAndReload();
    
    // Warte 500ms bevor die Tendies geladen werden
    setTimeout(() => {
        console.log('Starte verzögertes Laden der Tendies...');
        loadTendies();
    }, 500);
}

// Event Listener für die Filter-Buttons
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisiere Filter-Buttons...');
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Filter-Button geklickt:', button.dataset.filter);
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTendies();
        });
    });
});

// Starte die Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

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