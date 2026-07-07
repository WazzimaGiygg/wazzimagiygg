// Função para abrir imagens em nova aba quando clicadas
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todas as imagens da galeria e imagens responsivas
    const images = document.querySelectorAll('.gallery-img, .responsive-img');
    
    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            window.open(this.src, '_blank');
        });
    });
});
