// Créer les étoiles en arrière-plan
function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

function openPanel(content) {
    if (!content) return;

    // 1. En-tête du panneau
    document.getElementById('panel-title').innerText = content.name;
    document.getElementById('panel-icon').innerText = content.emoji;

    // 2. Injection du Template
    const panelBody = document.getElementById('panel-content');
    const template = document.getElementById(content.templateId);

    if (template) {
        panelBody.innerHTML = ''; 
        const clone = template.content.cloneNode(true);
        panelBody.appendChild(clone);
    } else {
        panelBody.innerHTML = `<p>Le contenu pour ${content.name} arrive bientôt...</p>`;
    }

    // 3. Style et Animation
    document.getElementById('info-panel').style.setProperty('--panel-accent', content.color);
    document.getElementById('info-panel').classList.add('active');
    document.getElementById('main-view').classList.add('shifted');

    isCentering = false; 
    isRotating = false;
}

function closePanel() {
    document.getElementById('info-panel').classList.remove('active');
    document.getElementById('main-view').classList.remove('shifted');
    isRotating = true;
}

// Initialiser les écouteurs d'événements UI
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
});

createStars();