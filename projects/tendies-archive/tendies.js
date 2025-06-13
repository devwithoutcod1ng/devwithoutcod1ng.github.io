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
    const container = document.querySelector('.tendies-grid');
    
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    if (!Array.isArray(tendies) || tendies.length === 0) {
        console.error('Keine gültigen Tendies zum Anzeigen');
        container.innerHTML = '<div class="error"><p data-i18n="tendies.error.none_found"></p></div>';
        setLanguage(localStorage.getItem('lang') || 'en'); // Aktualisiere den Text nach dem Laden
        return;
    }

    try {
        const html = tendies.map(tendie => {
            const title = tendie.name || 'Unbekannter Titel';
            
            // Konstruiere den Medienpfad basierend auf folder, name und videoformat
            const mediaPath = `tendies/${tendie.folder}/${tendie.name}/${tendie.name}.${tendie.videoformat}`;
            
            // Holen Sie sich den Download-Link und passen Sie den Button an
            const downloadLink = tendie.downloadLink;
            const downloadButtonHtml = downloadLink && downloadLink.trim() !== '' ?
                `<a href="${downloadLink}" class="tendies-download" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-download"></i> ${t('tendies.download')}
                </a>` :
                `<span class="tendies-download disabled">
                    <i class="fas fa-exclamation-circle"></i> ${t('tendies.download_unavailable')}
                </span>`;

            return `
                <div class="tendies-card">
                    <div class="tendies-video">
                        <video muted loop preload="auto" playsinline disablepictureinpicture controlslist="nodownload" oncontextmenu="return false;" src="${mediaPath}" alt="${title}" loading="lazy"></video>
                    </div>
                    <h3 class="tendies-title">${title}</h3>
                    ${downloadButtonHtml}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        setLanguage(localStorage.getItem('lang') || 'en'); // Aktualisiere den Text nach dem Laden

        // Füge Event-Listener für das Abspielen von Videos beim Hovern hinzu
        const tendieCards = document.querySelectorAll('.tendies-card');
        tendieCards.forEach(card => {
            const video = card.querySelector('.tendies-video video');
            if (video) {
                card.addEventListener('mouseover', () => {
                    video.play();
                });
                card.addEventListener('mouseout', () => {
                    video.pause();
                    video.currentTime = 0; // Setzt das Video zurück auf den Anfang
                });
            }
        });

    } catch (error) {
        console.error('Fehler beim Anzeigen der Tendies:', error);
        container.innerHTML = '<div class="error"><p data-i18n="tendies.error.loading"></p></div>';
        setLanguage(localStorage.getItem('lang') || 'en'); // Aktualisiere den Text nach dem Laden
    }
}

async function loadTendies(filter = 'custom') {
    const container = document.querySelector('.tendies-grid');
    
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    try {
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Lade Tendies...</p></div>';
        
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
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.tendies)) {
            throw new Error('Ungültiges Datenformat in tendies.json');
        }
        
        let processedTendies = data.tendies.filter(tendie => tendie.name);

        // Filterlogik hinzufügen
        if (filter === 'custom') {
            processedTendies = processedTendies.filter(tendie => tendie.custom === true);
        } else if (filter === 'apple') {
            processedTendies = processedTendies.filter(tendie => tendie.apple === true);
        }
        
        displayTendies(processedTendies);
    } catch (error) {
        console.error('Fehler beim Laden der Tendies:', error);
        if (container) {
            container.innerHTML = `
                <div class="error">
                    <p data-i18n="tendies.error.loading"></p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
            setLanguage(localStorage.getItem('lang') || 'en'); // Aktualisiere den Text nach dem Laden
        }
    }
}

// Initialisierung
async function initialize() {
    await clearCacheAndReload();
    
    // Warte 500ms bevor die Tendies geladen werden und lade mit Standardfilter 'custom'
    setTimeout(() => {
        loadTendies('custom'); 
    }, 500);
}

// Event Listener für die Filter-Buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTendies(filterType); // Übergib den Filterwert an loadTendies
        });
    });
});

// Starte die Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 