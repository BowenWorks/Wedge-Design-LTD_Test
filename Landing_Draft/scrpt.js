let scene, camera, renderer, controls;
let objects = [];
let rotationSpeed = 0.01;

function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    let aspect = window.innerWidth / window.innerHeight;
    let frustumSize = 50;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        1000
    );
    camera.position.set(0, 0, 100);

    // Create a renderer and add it to the DOM
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('modelCanvas').appendChild(renderer.domElement);

    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // Create ambient light
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create directional light
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load the model
    let loader = new THREE.OBJLoader();
    loader.load('path_to_your_model.obj', function (object) {
        scene.add(object);
        objects.push(object);
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    objects.forEach(object => {
        object.rotation.y += rotationSpeed;
    });

    controls.update();
    renderer.render(scene, camera);
}

init();
