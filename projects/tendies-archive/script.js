function renderTendies(tendies) {
    const container = document.getElementById('tendies-grid');
    container.innerHTML = '';

    if (!tendies || tendies.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <p>${t('tendies.error.none_found')}</p>
            </div>
        `;
        return;
    }

    tendies.forEach(tendie => {
        const tendieElement = document.createElement('div');
        tendieElement.className = 'tendie-item';
        
        // Wenn der Name leer ist, zeige eine leere Karte an
        if (!tendie.name) {
            tendieElement.innerHTML = `
                <div class="tendies-video">
                </div>
                <div class="tendies-info">
                    <h3></h3>
                </div>
            `;
        } else {
            const videoPath = `tendies/${tendie.folder}/${tendie.name}.${tendie.videoformat}`;
            const isVideo = isVideoFile(tendie.videoformat);
            const isImage = isImageFile(tendie.videoformat);

            tendieElement.innerHTML = `
                <div class="tendies-video">
                    ${isVideo ? `
                        <video 
                            src="${videoPath}" 
                            muted 
                            loop 
                            playsinline
                            preload="metadata"
                            onmouseover="this.play()" 
                            onmouseout="this.pause()"
                        ></video>
                    ` : isImage ? `
                        <img 
                            src="${videoPath}" 
                            alt="${tendie.name}"
                            loading="lazy"
                        >
                    ` : ''}
                </div>
                <div class="tendies-info">
                    <h3>${tendie.name}</h3>
                    ${tendie.downloadLink ? `
                        <a href="${tendie.downloadLink}" class="download-button" download>
                            ${t('tendies.download')}
                        </a>
                    ` : ''}
                </div>
            `;
        }
        container.appendChild(tendieElement);
    });
}

async function loadTendies() {
    try {
        const response = await fetch('tendies.json');
        if (!response.ok) {
            throw new Error('Failed to load tendies');
        }
        const data = await response.json();
        renderTendies(data.tendies);
    } catch (error) {
        console.error('Error loading tendies:', error);
        const container = document.getElementById('tendies-grid');
        container.innerHTML = `
            <div class="error-message">
                <p>${t('tendies.error.loading')}</p>
            </div>
        `;
    }
}

// Lade die Tendies beim Start
document.addEventListener('DOMContentLoaded', loadTendies);

// Event Listener für den Switch zwischen Apple und Custom
document.addEventListener('DOMContentLoaded', () => {
    const appleSwitch = document.getElementById('apple-switch');
    if (appleSwitch) {
        appleSwitch.addEventListener('change', () => {
            loadTendies();
        });
    }
});

// Hilfsfunktionen für Dateityp-Erkennung
function isVideoFile(filename) {
    const videoExtensions = ['mp4', 'mov', 'webm'];
    const extension = filename.toLowerCase();
    return videoExtensions.includes(extension);
}

function isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const extension = filename.toLowerCase();
    return imageExtensions.includes(extension);
} 