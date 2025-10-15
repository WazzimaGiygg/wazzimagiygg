function abrirJanela(id) {
    document.getElementById(id).style.display = 'block';
    // Aqui viria a lógica para trazer a janela para frente (z-index)
}

function fecharJanela(id) {
    document.getElementById(id).style.display = 'none';
}

// Lógica de arrastar a Janela (Simplificada)
const janela = document.getElementById('programa1');
const barraTitulo = janela.querySelector('.title-bar');
let isDragging = false;
let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

barraTitulo.addEventListener('mousedown', dragStart);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('mousemove', drag);

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, janela);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}
