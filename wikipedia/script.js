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

    // Adiciona animação de entrada suave para os cards de artigos
    const articleCards = document.querySelectorAll('.article-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });

    articleCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // Adiciona contador de artigos no console para SEO
    console.log(`📚 Total de artigos disponíveis: ${articleCards.length}`);
    console.log('📋 Dossiê completo carregado com sucesso!');
});
