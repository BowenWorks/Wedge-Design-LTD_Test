let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let objects = [];
let wireframeObjects = [];
let currentIntersectedObject = null;
let lastClickedObject = null;

let lastInteractionTime = Date.now();
let rotationSpeed = 0.01;  // Speed of rotation
let rotationTimeout = 5000; // 5 seconds timeout
let cameraDefaultPosition = new THREE.Vector3(0, 0, 50); // Default camera position
let frustumSize = 100; // Adjust to your needs

let isDragging = false;
let isMouseOverObject = false;
let mouseDownPosition = new THREE.Vector2();
let mouseUpPosition = new THREE.Vector2();
const DRAG_THRESHOLD = 5;  // Pixels of movement to consider as a drag

// Variables for dragging
let isRotating = false;
let dragStartPosition = new THREE.Vector2();
let dragCurrentPosition = new THREE.Vector2();

function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Set to transparent background
    document.body.appendChild(renderer.domElement);


    function moveObjectToRight(object, offset) {
    object.position.x += offset; // Move the object within the scene
}


    camera = new THREE.OrthographicCamera(
        -frustumSize / 2,   // left
        frustumSize / 2,    // right
        frustumSize / 2,    // top
        -frustumSize / 2,   // bottom
        0.1,                // near
        1000                // far
    );
    camera.position.copy(cameraDefaultPosition);
    camera.lookAt(scene.position);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    let loader = new THREE.OBJLoader();
    const objUrls = [
        'models/face1.obj', 
        'models/face2.obj', 
        'models/face3.obj', 
        'models/face4.obj', 
        'models/face5.obj'
    ];
    const wireframeUrls = [
        'models/wireframe1.obj',
    ];
    const links = [
        '../index.html',
        'files/face2.html',
        'files/face3.html',
        'files/face4.html',
        'files/face5.html'
    ];

    objUrls.forEach((url, index) => {
        loader.load(url, (object) => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    const wireframeMaterial = new THREE.MeshBasicMaterial({
                        color: 0x000000,
                        wireframe: true,
                        transparent: true,
                        opacity: 0
                    });

                    

                    const fillMaterial = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        transparent: true,
                        opacity: 0
                    });

                    child.material = fillMaterial;

                    const wireframe = new THREE.WireframeGeometry(child.geometry);
                    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
                    wireframeMesh.position.copy(child.position);
                    wireframeMesh.rotation.copy(child.rotation);
                    wireframeMesh.scale.copy(child.scale);

                    scene.add(wireframeMesh);
                    child.userData.wireframeMesh = wireframeMesh;
                }
            });
            object.position.set(0, 0, 0); // Adjust this to set the position
            object.userData = { url: links[index] };
            objects.push(object);
            scene.add(object);
        });
    });

    wireframeUrls.forEach((url) => {
        loader.load(url, (object) => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000
                    });
                }
            });

            wireframeObjects.push(object);
            scene.add(object);
        });
    });

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    fitToScreen();
}

function fitToScreen() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 3;
    camera.right = frustumSize * aspect / 3;
    camera.top = frustumSize / 3;
    camera.bottom = -frustumSize / 3;
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    fitToScreen();
}

function onMouseDown(event) {
    isDragging = false;
    mouseDownPosition.set(event.clientX, event.clientY);
    dragStartPosition.set(event.clientX, event.clientY); // Capture drag start position
}

function onMouseUp(event) {
    mouseUpPosition.set(event.clientX, event.clientY);
    if (mouseDownPosition.distanceTo(mouseUpPosition) > DRAG_THRESHOLD) {
        isDragging = true;
    }
}

function onMouseMove(event) {
    lastInteractionTime = Date.now();
    isMouseOverObject = false;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects, true);

    currentIntersectedObject = null;

    objects.forEach(object => {
        object.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.color.set(0x000000);
                child.material.opacity = 0;
                if (child.userData.wireframeMesh) {
                    child.userData.wireframeMesh.material.opacity = 0;
                }
            }
        });
    });

    if (intersects.length > 0) {
        isMouseOverObject = true;  // Mouse is hovering over an object
        currentIntersectedObject = intersects[0].object;
        currentIntersectedObject.material.color.set(0x000DFF);
        currentIntersectedObject.material.opacity = 1;
        if (currentIntersectedObject.userData.wireframeMesh) {
            currentIntersectedObject.userData.wireframeMesh.material.opacity = 0;
        }

        document.body.style.cursor = "pointer";
    } else {
        document.body.style.cursor = "default";
    }

    // Handle rotation based on dragging
    if (isDragging && currentIntersectedObject) {
        dragCurrentPosition.set(event.clientX, event.clientY);
        const deltaX = dragCurrentPosition.x - dragStartPosition.x;
        const deltaY = dragCurrentPosition.y - dragStartPosition.y;

        const rotationSpeed = 0.005;
        currentIntersectedObject.rotation.y += deltaX * rotationSpeed;
        currentIntersectedObject.rotation.x += deltaY * rotationSpeed;

        dragStartPosition.copy(dragCurrentPosition);
    }
}

function onMouseClick(event) {
    lastInteractionTime = Date.now();

    if (currentIntersectedObject && !isDragging) {
        lastClickedObject = currentIntersectedObject;
        setTimeout(() => {
            if (lastClickedObject) {
                window.location.href = lastClickedObject.parent.userData.url;
                lastClickedObject = null;
            }
        }, 0);
    }
}

function autoRotateModel() {
    if (!isMouseOverObject) {
        objects.forEach(object => {
            object.rotation.y += rotationSpeed;
        });
    }
}

function resetCameraPosition() {
    camera.position.lerp(cameraDefaultPosition, 0.05);
}

function moveObjectToRight(object, offset) {
    object.updateMatrixWorld();
    const offsetVector = new THREE.Vector3(offset, 0, 0); // Moving right by 'offset'
    const cameraWorldMatrix = camera.matrixWorld;
    offsetVector.applyMatrix4(cameraWorldMatrix);
    object.position.add(offsetVector);
}

// Example usage: Move the first object in the 'objects' array 10 units to the right
if (objects.length > 0) {
    moveObjectToRight(objects[0], 10);
}

function animate() {
    requestAnimationFrame(animate);

    const now = Date.now();
    const elapsedTime = now - lastInteractionTime;

    if (elapsedTime > rotationTimeout) {
        autoRotateModel();
    }

    if (elapsedTime > rotationTimeout / 2) {
        resetCameraPosition();
    }

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();




document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const sideNav = document.querySelector('.side-nav');

    menuIcon.addEventListener('click', function() {
        sideNav.classList.toggle('active');
    });
});




