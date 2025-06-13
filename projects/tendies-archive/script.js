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
        const videoPath = `tendies/${tendie.folder}/${tendie.name}/${tendie.videoname}`;
        const fileType = getFileType(tendie.videoname);
        const isVideo = isVideoFile(tendie.videoname);
        const isImage = isImageFile(tendie.videoname);

        const tendieElement = document.createElement('div');
        tendieElement.className = 'tendie-item';
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
                <a href="${tendie.downloadLink}" class="download-button" download>
                    ${t('tendies.download')}
                </a>
            </div>
        `;
        container.appendChild(tendieElement);
    });
} 