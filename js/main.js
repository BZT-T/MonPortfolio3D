// js/main.js

// Variables globales partagées
let scene, camera, renderer, planet, raycaster, mouse;
let islands = [];
let isRotating = true; // Pour la rotation automatique
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let isCentering = false;
let dragStartPosition = { x: 0, y: 0 };

const contentFlow = [
    {
        name: 'Présentation',
        templateId: 'tpl-presentation',
        emoji: '🏠',
        color: '#00ff88'
    },
    {
        name: 'Projets',
        templateId: 'tpl-projets',
        emoji: '💼',
        color: '#ff6b35'
    },
    {
        name: 'Compétences',
        templateId: 'tpl-competences',
        emoji: '🛠️',
        color: '#4ecdc4'
    },
    {
        name: 'Contact',
        templateId: 'tpl-contact',
        emoji: '📧',
        color: '#a855f7'
    }
];

let currentStep = 0; // On commence toujours par le premier élément de contentFlow

let isMouseDown = false;
let isMouseMoving = false;

/**
 * Initialisation du moteur Three.js
 */
function init() {
    // 1. Scène et Caméra
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // 2. Renderer (Rendu graphique)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 3. Outils d'interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 4. Lumières (Configurées ici puisque scene.js n'est pas utilisé)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    // 5. Création des objets (venant de planet.js)
    createPlanet();
    createIslands();

    // 6. Écouteurs d'événements
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Gestion du Drag & Drop pour la rotation
    window.addEventListener('mousedown', (e) => {

        isRotating = false; // On stoppe la rotation auto quand l'utilisateur touche la planète
        isCentering = false; // AJOUT : On annule le recentrage auto si l'utilisateur reprend la main

        resetDragFlag();
        isMouseDown = true;

        dragStartPosition.x = e.clientX;
        dragStartPosition.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {

        isRotating = true;
    });

    window.addEventListener('mousemove', (e) => {

        isMouseMoving = true;
        // Coordonnées normalisées pour le Raycaster
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Logique de rotation par "cliquer-glisser"
        if (isDragging() && planet) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };

            // On ajuste la rotation (0.005 est la sensibilité)
            planet.rotation.y += deltaMove.x * 0.005;
            planet.rotation.x += deltaMove.y * 0.005;
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };

        // Curseur pointer si on survole une île
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(islands, true);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });

    window.addEventListener('click', (e) => {
        if (isDragging()) {
            resetDragFlag();
            return;
        }
        resetDragFlag();

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(islands, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && obj.userData.visited === undefined) {
                obj = obj.parent;
            }

            // DÉCOUVERTE D'UNE NOUVELLE ÎLE
            if (!obj.userData.visited && currentStep < contentFlow.length) {
                const content = contentFlow[currentStep];

                // ON UNIFORMISE ICI : on stocke l'objet sous le nom 'content'
                obj.userData.content = content;
                obj.userData.visited = true;

                addFlagToIsland(obj, content);

                const wave = obj.getObjectByName("wave");
                if (wave) wave.material.color.set(content.color);

                currentStep++;
            }

            // AFFICHAGE DU PANNEAU
            if (obj.userData.content) {
                const targetPosition = obj.position.clone();
                const rawTargetY = -Math.atan2(targetPosition.x, targetPosition.z);
                const rawTargetX = Math.asin(targetPosition.y / targetPosition.length());

                targetRotation.y = getShortestAngle(planet.rotation.y, rawTargetY);
                targetRotation.x = getShortestAngle(planet.rotation.x, rawTargetX);
                isCentering = true;

                // Appel uniforme
                setTimeout(() => openPanel(obj.userData.content), 200);
            }
        }
    });

    // 7. Lancement de l'animation
    animate();
}

/**
 * Boucle d'animation (60 FPS)
 */
function animate() {
    requestAnimationFrame(animate);

    if (isCentering) {
        // Vitesse de lissage (0.08 est un bon compromis entre réactivité et douceur)
        const lerpSpeed = 0.08;

        planet.rotation.x += (targetRotation.x - planet.rotation.x) * lerpSpeed;
        planet.rotation.y += (targetRotation.y - planet.rotation.y) * lerpSpeed;

        // Arrêt précis
        if (Math.abs(planet.rotation.x - targetRotation.x) < 0.001 &&
            Math.abs(planet.rotation.y - targetRotation.y) < 0.001) {
            isCentering = false;
        }
    } else if (isRotating && planet) {
        planet.rotation.y += 0.0001;
    }

    // Animation de "pulsation" des îles (venant de tes anciens scripts)
    islands.forEach((island, index) => {
        const glow = island.children.find(child => child.type === "Mesh" && child.material.transparent);
        if (glow) {
            glow.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + index) * 0.1);
        }
    });

    // Mise à jour des labels HTML (si tu as gardé la fonction dans planet.js)
    if (typeof updateLabels === "function") {
        updateLabels();
    }

    renderer.render(scene, camera);
}

function getShortestAngle(current, target) {
    let diff = (target - current) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff;
}

function updateLabels() {
    islands.forEach(island => {
        if (island.userData.htmlElement) {
            const element = island.userData.htmlElement;
            const vector = new THREE.Vector3();

            // On récupère la position du haut du mât
            island.getWorldPosition(vector);
            vector.y += 0.8; // On monte un peu pour être au-dessus du mât

            // Projection de la position 3D vers l'écran 2D
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            // Cacher le label si l'île est derrière la planète
            const cameraDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            const islandDistance = camera.position.distanceTo(vector);

            element.style.opacity = islandDistance > cameraDistance ? "0" : "1";
        }
    });
}

function isDragging() {
    return isMouseDown && isMouseMoving;
}

function resetDragFlag() {
    isMouseDown = false;
    isMouseMoving = false;
}
// Lancement
init();