
function createPlanet() {
    planet = new THREE.Group();
    scene.add(planet);

    const loader = new THREE.GLTFLoader();
    loader.load('Planete.glb', function (gltf) {
        const model = gltf.scene;
        model.scale.set(2, 2, 2); 
        planet.add(model);
    }, undefined, function (error) {
        console.error("Erreur GLB:", error);
        // Backup Sphère
        const geo = new THREE.SphereGeometry(3, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x1a2845, wireframe: true });
        planet.add(new THREE.Mesh(geo, mat));
    });
}

function createIslands() {
    // On ne met que les positions, le reste est géré dynamiquement au clic
    const islandPositions = [
        [2, 3.1, 0],
        [-1.5, 0, 3.2],
        [0, -3.5, -1],
        [-2, 1, -3]
    ];

    islandPositions.forEach(pos => {
        const group = new THREE.Group();

        // Hitbox invisible pour le clic
        const geo = new THREE.IcosahedronGeometry(0.85, 0);
        const mat = new THREE.MeshBasicMaterial({ visible: false });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        // Onde (Neutre au début)
        const waveGeo = new THREE.RingGeometry(0.8, 1.0, 32); // Intérieur, Extérieur
        const waveMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.name = "wave";
        group.add(wave);

        group.position.set(...pos);
        
        // Oriente l'île vers l'extérieur
        group.lookAt(group.position.clone().multiplyScalar(2));

        // État initial
        group.userData = { visited: false };

        planet.add(group);
        islands.push(group);
    });
    
}

// Appelée uniquement par main.js lors d'une découverte
function addFlagToIsland(islandGroup, content) {
    const label = document.createElement('div');
    label.className = 'island-label';
    label.style.setProperty('--accent-color', content.color);
    label.innerHTML = `${content.emoji} ${content.name}`;
    
    document.getElementById('island-labels').appendChild(label);

    // Lie l'élément HTML à l'objet 3D pour le suivi dans animate()
    islandGroup.userData.htmlElement = label;
    
    // Applique la couleur du contenu à l'onde
    const wave = islandGroup.getObjectByName("wave");
    if (wave) {
        wave.material.color.set(content.color);
        wave.material.opacity = 0.8;
    }
}