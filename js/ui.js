const contentData = {
    'modal-presentation': {
        title: "Présentation",
        icon: "🏠",
        html: "<h3>Qui suis-je ?</h3><p>Développeur créatif...</p>"
    },
    'modal-projets': {
        title: "Projets",
        icon: "💼",
        html: "<ul><li>Projet A</li><li>Projet B</li></ul>"
    }
    // Ajoute les autres ici...
};

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

function openPanel(modalKey) {
    const data = contentData[modalKey];
    if (!data) return;

    // Injecter le contenu
    document.getElementById('panel-title').innerText = data.title;
    document.getElementById('panel-icon').innerText = data.icon;
    document.getElementById('panel-content').innerHTML = data.html;

    // OUVERTURE : On active le panel et on décale le canvas
    document.getElementById('info-panel').classList.add('active');
    document.getElementById('main-view').classList.add('shifted');

    isCentering = false; // On laisse le décalage CSS gérer la vue
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