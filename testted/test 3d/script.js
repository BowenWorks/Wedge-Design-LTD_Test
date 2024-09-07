const pyramid = document.querySelector('.pyramid-container');
let isDragging = false;
let startX, startY;
let currentRotationX = 0;
let currentRotationY = 0;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    currentRotationX -= deltaY * 0.5;  // Adjust sensitivity here
    currentRotationY += deltaX * 0.5;  // Adjust sensitivity here

    // Apply rotation to the pyramid
    pyramid.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;

    startX = e.clientX;
    startY = e.clientY;
}

function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Optional: Prevent the default action of dragging the text
document.addEventListener('dragstart', (e) => e.preventDefault());
