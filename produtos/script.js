// ===== COOKIE CONSENT =====
document.addEventListener('DOMContentLoaded', function() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptAllBtn = document.getElementById('cookieAcceptAll');
    const rejectAllBtn = document.getElementById('cookieRejectAll');
    const customizeBtn = document.getElementById('cookieCustomize');

    // Verifica se o usuário já fez uma escolha
    if (localStorage.getItem('cookieConsent')) {
        cookieConsent.classList.add('hidden');
    }

    // Aceitar todos
    acceptAllBtn.addEventListener('click', function() {
        setCookiePreferences({
            essential: true,
            analytics: true,
            advertising: true
        });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'accepted');
    });

    // Recusar todos
    rejectAllBtn.addEventListener('click', function() {
        setCookiePreferences({
            essential: true,
            analytics: false,
            advertising: false
        });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'rejected');
    });

    // Personalizar
    customizeBtn.addEventListener('click', function() {
        const analytics = document.getElementById('cookieAnalytics').checked;
        const advertising = document.getElementById('cookieAdvertising').checked;
        
        setCookiePreferences({
            essential: true,
            analytics: analytics,
            advertising: advertising
        });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'customized');
    });

    function setCookiePreferences(prefs) {
        // Simula o salvamento das preferências
        console.log('Preferências de cookies salvas:', prefs);
        // Aqui você pode implementar a lógica real de cookies
        document.cookie = `cookie_analytics=${prefs.analytics}; path=/; max-age=${60*60*24*365}`;
        document.cookie = `cookie_advertising=${prefs.advertising}; path=/; max-age=${60*60*24*365}`;
    }
});

// ===== ABRIR PRODUTO =====
function openProduct(url) {
    // Abre em uma nova aba
    window.open(url, '_blank');
}

// ===== ANIMAÇÃO DE ENTRADA DOS CARDS =====
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.product-card, .feature-card');
    
    // Usa Intersection Observer para animar os cards quando aparecem
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Adiciona um atraso para criar efeito cascata
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// ===== EFEITO DE PARALLAX NO HEADER =====
document.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (header && scrollY < 600) {
        header.style.backgroundPositionY = `${scrollY * 0.3}px`;
    }
});

// ===== CONTADOR DE ESTATÍSTICAS (ANIMAÇÃO) =====
document.addEventListener('DOMContentLoaded', function() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                
                // Se contém números, anima
                if (text.match(/\d+/)) {
                    const num = parseInt(text);
                    if (!isNaN(num)) {
                        animateNumber(target, num);
                    }
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
});

function animateNumber(element, target) {
    let current = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = duration / 60;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, interval);
}

// ===== CLOSE COOKIE BANNER COM ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const cookieConsent = document.getElementById('cookieConsent');
        if (cookieConsent && !cookieConsent.classList.contains('hidden')) {
            // Não fecha com ESC para forçar escolha
            // Mas podemos mostrar um aviso sutil
            const btn = document.getElementById('cookieAcceptAll');
            if (btn) {
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }
});

// ===== LOG PARA DEBUG =====
console.log('🚀 WazzimaGiygg - Conhecimento Livre para Todos');
console.log('📦 Produtos carregados com sucesso!');
console.log('💡 Desenvolvido com ❤️ e DeepSeek AI');
