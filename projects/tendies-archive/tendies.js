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
        setLanguage(localStorage.getItem('lang') || 'en');
        return;
    }

    try {
        const html = tendies.map(tendie => {
            const title = tendie.name || 'Unbekannter Titel';
            
            // Konstruiere den Medienpfad basierend auf folder, name und format
            const mediaPath = `tendies/${tendie.folder}/${tendie.name}/${tendie.name}.${tendie.videoformat || tendie.imageformat}`;
            
            // Bestimme den Medientyp
            const isVideo = ['mp4', 'webm', 'mov'].includes(tendie.videoformat?.toLowerCase());
            const isImage = ['jpg', 'jpeg', 'png'].includes((tendie.videoformat || tendie.imageformat)?.toLowerCase());
            
            // Holen Sie sich den Download-Link und passen Sie den Button an
            const downloadLink = tendie.downloadLink;
            const downloadButtonHtml = downloadLink && downloadLink.trim() !== '' ?
                `<a href="${downloadLink}" class="tendies-download" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-download"></i> ${t('tendies.download')}
                </a>` :
                `<span class="tendies-download disabled">
                    <i class="fas fa-exclamation-circle"></i> ${t('tendies.download_unavailable')}
                </span>`;

            // Erstelle das Medien-Element basierend auf dem Typ
            let mediaElement;
            if (isVideo) {
                mediaElement = `
                    <video muted loop preload="metadata" playsinline disablepictureinpicture controlslist="nodownload" 
                           src="${mediaPath}" alt="${title}" loading="lazy" 
                           onerror="this.closest('.tendies-video').classList.add('error-placeholder'); this.remove();"
                           onloadeddata="this.style.opacity='1'">
                    </video>`;
            } else if (isImage) {
                mediaElement = `
                    <img src="${mediaPath}" alt="${title}" loading="lazy" 
                         onerror="this.closest('.tendies-video').classList.add('error-placeholder'); this.remove();"
                         onload="this.style.opacity='1'">`;
            } else {
                mediaElement = `<div class="error-placeholder">Unbekanntes Format</div>`;
            }

            return `
                <div class="tendies-card">
                    <div class="tendies-video">
                        ${mediaElement}
                    </div>
                    <h3 class="tendies-title">${title}</h3>
                    ${downloadButtonHtml}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        setLanguage(localStorage.getItem('lang') || 'en');

        // Füge Event-Listener für Hover-Effekte hinzu
        const tendieCards = document.querySelectorAll('.tendies-card');
        tendieCards.forEach(card => {
            const video = card.querySelector('video');
            const img = card.querySelector('img');
            
            if (video) {
                // Video Hover-Effekte
                let playPromise;
                card.addEventListener('mouseenter', async () => {
                    try {
                        if (playPromise !== undefined) {
                            await playPromise;
                        }
                        playPromise = video.play();
                        await playPromise;
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            console.warn('Video konnte nicht abgespielt werden:', error);
                        }
                    }
                });
                
                card.addEventListener('mouseleave', async () => {
                    try {
                        if (playPromise !== undefined) {
                            await playPromise;
                        }
                        video.pause();
                        video.currentTime = 0;
                    } catch (error) {
                        console.warn('Video konnte nicht pausiert werden:', error);
                    }
                });
            } else if (img) {
                // Bild Hover-Effekte
                card.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.05)';
                    img.style.transition = 'transform 0.3s ease';
                });
                card.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
            }
        });

    } catch (error) {
        console.error('Fehler beim Anzeigen der Tendies:', error);
        container.innerHTML = '<div class="error"><p data-i18n="tendies.error.loading"></p></div>';
        setLanguage(localStorage.getItem('lang') || 'en');
    }
}

async function loadTendies(filter = 'custom') {
    const container = document.querySelector('.tendies-grid');
    
    if (!container) {
        console.error('Container .tendies-grid nicht gefunden!');
        return;
    }

    try {
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p data-i18n="tendies.loading_scroll_prompt"></p></div>';
        
        // Korrekter Pfad zur tendies.json
        const response = await fetch('./tendies.json', {
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
            setLanguage(localStorage.getItem('lang') || 'en');
        }
    }
}

// Initialisierungs-Lock und Controller
let isInitializing = false;
let initializationPromise = null;
let abortController = null;

// Funktion zum Abbrechen laufender Initialisierungen
function cancelRunningInitialization() {
    if (abortController) {
        console.log('Breche laufende Initialisierung ab...');
        abortController.abort();
        abortController = null;
    }
    isInitializing = false;
    initializationPromise = null;
}

// Verbesserte Initialisierung
async function initialize() {
    try {
        console.log('Initialisiere Tendies-Archiv...');
        await clearCacheAndReload();
        
        // Warte auf vollständiges DOM-Loading
        if (document.readyState === 'loading') {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('DOM-Loading Timeout'));
                }, 5000);
                
                document.addEventListener('DOMContentLoaded', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        }
        
        // Initialisiere Filter-Buttons
        const filterButtons = document.querySelectorAll('.filter-button');
        if (filterButtons.length === 0) {
            console.warn('Keine Filter-Buttons gefunden');
        }
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.dataset.filter;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                loadTendies(filterType);
            });
        });
        
        // Warte 500ms bevor die Tendies geladen werden
        console.log('Warte 500ms vor dem Laden der Tendies...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Lade die Tendies
        await loadTendies('custom');
        console.log('Tendies-Archiv erfolgreich initialisiert');
    } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        const container = document.querySelector('.tendies-grid');
        if (container) {
            container.innerHTML = `
                <div class="error">
                    <p data-i18n="tendies.error.loading"></p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
            setLanguage(localStorage.getItem('lang') || 'en');
        }
    }
}

// Event-Listener für Seitenaktualisierungen
window.addEventListener('beforeunload', () => {
    cancelRunningInitialization();
});

// Event-Listener für Seitenaktualisierungen
window.addEventListener('load', () => {
    // Starte die Initialisierung mit Fehlerbehandlung
    initialize().catch(error => {
        if (error.name !== 'AbortError' && error.message !== 'Initialisierung wurde abgebrochen') {
            console.error('Kritischer Fehler bei der Initialisierung:', error);
            // Zeige Fehlermeldung an
            const container = document.querySelector('.tendies-grid');
            if (container) {
                container.innerHTML = `
                    <div class="error">
                        <p data-i18n="tendies.error.loading"></p>
                        <p class="error-details">Ein kritischer Fehler ist aufgetreten. Bitte laden Sie die Seite neu.</p>
                    </div>
                `;
                setLanguage(localStorage.getItem('lang') || 'en');
            }
        }
    });
}); 