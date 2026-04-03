let currentGalleryImages = [];
let currentImageIndex = 0;

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

function moveCarousel(button, direction) {
    const carousel = button.closest('.project-carousel');
    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');
    
    // Trouver l'index actuel
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    
    // Retirer la classe active partout
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    // Calculer le nouvel index
    currentIndex += direction;
    
    // Bouclage (si on dépasse, on revient au début ou à la fin)
    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;
    
    // Appliquer la nouvelle classe active
    images[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}


// Fonction pour fermer la lightbox
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function openLightbox(imgElement) {
    const carousel = imgElement.closest('.carousel-track');
    // On récupère toutes les images de CE projet uniquement
    currentGalleryImages = Array.from(carousel.querySelectorAll('.carousel-img'));
    currentImageIndex = currentGalleryImages.indexOf(imgElement);

    updateLightbox();
    document.getElementById('lightbox').classList.add('active');
}

function updateLightbox() {
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = currentGalleryImages[currentImageIndex].src;
    
    // On cache les flèches s'il n'y a qu'une seule image
    const btns = document.querySelectorAll('.lb-btn');
    btns.forEach(b => b.style.display = currentGalleryImages.length > 1 ? 'block' : 'none');
}

function changeLightboxImage(direction) {
    currentImageIndex += direction;
    
    // Bouclage
    if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
    
    updateLightbox();
}

// Mise à jour de l'écouteur de clic global
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-img')) {
        openLightbox(e.target);
    }
});

// Mise à jour de l'écouteur Lightbox pour le nouveau nom de classe
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-img')) {
        console.log("co");
        openLightbox(e.target.src);
    }
});

// Initialiser les écouteurs d'événements UI
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
});

function discoverIsland(obj) {
    // Si l'île a déjà été visitée ou si on a épuisé le contenu, on s'arrête
    if (obj.userData.visited || currentStep >= contentFlow.length) return;

    const content = contentFlow[currentStep];
    obj.userData.content = content;
    obj.userData.visited = true;

    // Ajout du drapeau/emoji
    if (typeof addFlagToIsland === "function") {
        addFlagToIsland(obj, content);
    }

    // Changement de couleur de la vague
    const wave = obj.getObjectByName("wave");
    if (wave) wave.material.color.set(content.color);

    // On passe à l'étape suivante
    currentStep++;
}

function revealAllIslands() {
    console.log("🛰️ Scanner activé : Déploiement de toutes les îles !");
    
    islands.forEach((island, index) => {
        setTimeout(() => {
            // On appelle la nouvelle fonction de découverte
            discoverIsland(island);
            
            // Effet visuel de flash
            const mesh = island.children.find(c => c.type === "Mesh");
            if (mesh && mesh.material) {
                const originalColor = mesh.material.color.getHex();
                mesh.material.color.setHex(0x00ff88); 
                setTimeout(() => {
                    mesh.material.color.setHex(originalColor);
                }, 500);
            }
        }, index * 200);
    });
}

createStars();