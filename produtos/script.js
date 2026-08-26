// ===== DETECÇÃO DE IDIOMA =====
function detectLanguage() {
    // 1. Verifica se há preferência salva
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && window.translations[savedLang]) {
        return savedLang;
    }

    // 2. Detecta idioma do navegador
    const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR';
    
    // 3. Verifica se o idioma está disponível
    const availableLangs = Object.keys(window.translations);
    
    // 4. Tenta encontrar correspondência exata ou aproximada
    for (const lang of availableLangs) {
        if (browserLang === lang || browserLang.startsWith(lang.split('-')[0])) {
            return lang;
        }
    }

    // 5. Fallback para português
    return 'pt-BR';
}

// ===== APLICAR TRADUÇÃO =====
function applyTranslations(lang) {
    const t = window.translations[lang];
    if (!t) return;

    // Atualiza elementos com IDs
    const elements = {
        pageTitle: document.getElementById('pageTitle'),
        cookieTitle: document.getElementById('cookieTitle'),
        cookieDesc: document.getElementById('cookieDesc'),
        cookieEssentialLabel: document.getElementById('cookieEssentialLabel'),
        cookieAnalyticsLabel: document.getElementById('cookieAnalyticsLabel'),
        cookieAdvertisingLabel: document.getElementById('cookieAdvertisingLabel'),
        headerTitle: document.getElementById('headerTitle'),
        headerTagline: document.getElementById('headerTagline'),
        statProducts: document.getElementById('statProducts'),
        statProductsLabel: document.getElementById('statProductsLabel'),
        statContentLabel: document.getElementById('statContentLabel'),
        statGlobalLabel: document.getElementById('statGlobalLabel'),
        productsTitle: document.getElementById('productsTitle'),
        productsSubtitle: document.getElementById('productsSubtitle'),
        badgeFree: document.getElementById('badgeFree'),
        badgeLaunch: document.getElementById('badgeLaunch'),
        badgePopular: document.getElementById('badgePopular'),
        badgeNew: document.getElementById('badgeNew'),
        product1Title: document.getElementById('product1Title'),
        product1Desc: document.getElementById('product1Desc'),
        product1Link: document.getElementById('product1Link'),
        product2Title: document.getElementById('product2Title'),
        product2Desc: document.getElementById('product2Desc'),
        product2Link: document.getElementById('product2Link'),
        product3Title: document.getElementById('product3Title'),
        product3Desc: document.getElementById('product3Desc'),
        product3Link: document.getElementById('product3Link'),
        product4Title: document.getElementById('product4Title'),
        product4Desc: document.getElementById('product4Desc'),
        product4Link: document.getElementById('product4Link'),
        product5Title: document.getElementById('product5Title'),
        product5Desc: document.getElementById('product5Desc'),
        product5Link: document.getElementById('product5Link'),
        product6Title: document.getElementById('product6Title'),
        product6Desc: document.getElementById('product6Desc'),
        product6Link: document.getElementById('product6Link'),
        featuresTitle: document.getElementById('featuresTitle'),
        feature1Title: document.getElementById('feature1Title'),
        feature1Desc: document.getElementById('feature1Desc'),
        feature2Title: document.getElementById('feature2Title'),
        feature2Desc: document.getElementById('feature2Desc'),
        feature3Title: document.getElementById('feature3Title'),
        feature3Desc: document.getElementById('feature3Desc'),
        feature4Title: document.getElementById('feature4Title'),
        feature4Desc: document.getElementById('feature4Desc'),
        feature5Title: document.getElementById('feature5Title'),
        feature5Desc: document.getElementById('feature5Desc'),
        feature6Title: document.getElementById('feature6Title'),
        feature6Desc: document.getElementById('feature6Desc'),
        donationTitle: document.getElementById('donationTitle'),
        donationDesc: document.getElementById('donationDesc'),
        donationBtnText: document.getElementById('donationBtnText'),
        supportBtnText: document.getElementById('supportBtnText'),
        transparencyTitle: document.getElementById('transparencyTitle'),
        transparencyDesc: document.getElementById('transparencyDesc'),
        transparencyStat1: document.getElementById('transparencyStat1'),
        transparencyStat2: document.getElementById('transparencyStat2'),
        transparencyStat3: document.getElementById('transparencyStat3'),
        footerAboutTitle: document.getElementById('footerAboutTitle'),
        footerAboutDesc: document.getElementById('footerAboutDesc'),
        footerLinksTitle: document.getElementById('footerLinksTitle'),
        footerLink1: document.getElementById('footerLink1'),
        footerLink2: document.getElementById('footerLink2'),
        footerLink3: document.getElementById('footerLink3'),
        footerLink4: document.getElementById('footerLink4'),
        footerLink5: document.getElementById('footerLink5'),
        footerLegalTitle: document.getElementById('footerLegalTitle'),
        footerLegal1: document.getElementById('footerLegal1'),
        footerLegal2: document.getElementById('footerLegal2'),
        footerLegal3: document.getElementById('footerLegal3'),
        footerSocialTitle: document.getElementById('footerSocialTitle'),
        certLabel: document.getElementById('certLabel'),
        certSealLabel: document.getElementById('certSealLabel'),
        certThanks: document.getElementById('certThanks'),
        footerCopyright: document.getElementById('footerCopyright'),
        footerLove: document.getElementById('footerLove')
    };

    // Atualiza textos
    for (const [id, element] of Object.entries(elements)) {
        if (element && t[id] !== undefined) {
            // Para elementos com HTML (como <a> dentro), usar innerHTML
            if (id === 'cookieDesc' || id === 'certThanks') {
                element.innerHTML = t[id];
            } else {
                element.textContent = t[id];
            }
        }
    }

    // Atualiza botões do cookie
    const cookieAccept = document.getElementById('cookieAcceptAll');
    const cookieReject = document.getElementById('cookieRejectAll');
    const cookieCustomize = document.getElementById('cookieCustomize');
    if (cookieAccept) cookieAccept.textContent = t.cookieAccept || '✅ Aceitar Todos';
    if (cookieReject) cookieReject.textContent = t.cookieReject || '❌ Recusar Todos';
    if (cookieCustomize) cookieCustomize.textContent = t.cookieCustomize || '⚙️ Personalizar';

    // Atualiza atributo lang do HTML
    document.documentElement.lang = lang;

    // Salva preferência
    localStorage.setItem('preferredLanguage', lang);

    // Log
    console.log(`🌍 Idioma alterado para: ${lang}`);
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Detecta e aplica idioma
    const lang = detectLanguage();
    applyTranslations(lang);

    // Configura seletor de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (window.translations[lang]) {
                applyTranslations(lang);
                // Atualiza classe ativa
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Marca botão ativo
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Inicializa outras funcionalidades
    initCookieConsent();
    initCardAnimations();
    initParallax();
    initStatCounters();
});

// ===== COOKIE CONSENT =====
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptAllBtn = document.getElementById('cookieAcceptAll');
    const rejectAllBtn = document.getElementById('cookieRejectAll');
    const customizeBtn = document.getElementById('cookieCustomize');

    if (localStorage.getItem('cookieConsent')) {
        cookieConsent.classList.add('hidden');
    }

    acceptAllBtn.addEventListener('click', function() {
        setCookiePreferences({ essential: true, analytics: true, advertising: true });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'accepted');
    });

    rejectAllBtn.addEventListener('click', function() {
        setCookiePreferences({ essential: true, analytics: false, advertising: false });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'rejected');
    });

    customizeBtn.addEventListener('click', function() {
        const analytics = document.getElementById('cookieAnalytics').checked;
        const advertising = document.getElementById('cookieAdvertising').checked;
        setCookiePreferences({ essential: true, analytics, advertising });
        cookieConsent.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'customized');
    });
}

function setCookiePreferences(prefs) {
    console.log('Preferências de cookies salvas:', prefs);
    document.cookie = `cookie_analytics=${prefs.analytics}; path=/; max-age=${60*60*24*365}`;
    document.cookie = `cookie_advertising=${prefs.advertising}; path=/; max-age=${60*60*24*365}`;
}

// ===== ABRIR PRODUTO =====
function openProduct(url) {
    window.open(url, '_blank');
}

// ===== ANIMAÇÃO DE ENTRADA =====
function initCardAnimations() {
    const cards = document.querySelectorAll('.product-card, .feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// ===== PARALLAX =====
function initParallax() {
    document.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        if (header && scrollY < 600) {
            header.style.backgroundPositionY = `${scrollY * 0.3}px`;
        }
    });
}

// ===== CONTADOR DE ESTATÍSTICAS =====
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
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
}

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

console.log('🚀 WazzimaGiygg - Conhecimento Livre para Todos');
console.log('🌍 Sistema de internacionalização ativo!');
console.log('📦 Produtos carregados com sucesso!');
