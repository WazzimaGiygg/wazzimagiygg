// ============================================
// I18N - Motor de Internacionalização
// ============================================

const I18N = {
    currentLocale: 'pt',
    availableLocales: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru', 'ar', 'hi', 'el'],
    translations: {},
    loaded: false,
    callbacks: [],
    
    // Inicializar
    init: function() {
        console.log('🌍 Inicializando sistema de internacionalização...');
        
        // Detectar idioma preferido do navegador
        const detected = this.detectLanguage();
        console.log(`🌍 Idioma detectado: ${detected}`);
        
        // Verificar se há preferência salva
        const saved = localStorage.getItem('wzzm_language');
        if (saved && this.availableLocales.includes(saved)) {
            this.currentLocale = saved;
            console.log(`🌍 Usando preferência salva: ${saved}`);
        } else {
            this.currentLocale = detected;
            localStorage.setItem('wzzm_language', this.currentLocale);
        }
        
        // Carregar traduções
        this.loadTranslations(this.currentLocale);
    },
    
    // Detectar idioma do navegador
    detectLanguage: function() {
        const languages = navigator.languages || [navigator.language];
        for (const lang of languages) {
            const locale = lang.split('-')[0].toLowerCase();
            if (this.availableLocales.includes(locale)) {
                return locale;
            }
        }
        return 'pt'; // Fallback para português
    },
    
    // Carregar traduções
    loadTranslations: function(locale) {
        const self = this;
        
        // Verificar se já temos a tradução em cache
        if (this.translations[locale]) {
            this.applyTranslations(locale);
            return;
        }
        
        // Carregar o arquivo de tradução
        const script = document.createElement('script');
        script.src = `i18n/${locale}.js`;
        script.onload = function() {
            if (window[`i18n_${locale}`]) {
                self.translations[locale] = window[`i18n_${locale}`];
                self.applyTranslations(locale);
            } else {
                console.error(`❌ Tradução para ${locale} não encontrada`);
                // Fallback para português
                if (locale !== 'pt') {
                    self.loadTranslations('pt');
                }
            }
        };
        script.onerror = function() {
            console.error(`❌ Erro ao carregar tradução para ${locale}`);
            if (locale !== 'pt') {
                self.loadTranslations('pt');
            }
        };
        document.head.appendChild(script);
    },
    
    // Aplicar traduções
    applyTranslations: function(locale) {
        const data = this.translations[locale];
        if (!data) {
            console.error(`❌ Tradução para ${locale} não disponível`);
            return;
        }
        
        this.currentLocale = locale;
        localStorage.setItem('wzzm_language', locale);
        
        // Atualizar seletor de idioma
        const select = document.getElementById('languageSelect');
        if (select) {
            select.value = locale;
        }
        
        // Atualizar título da página
        if (data.meta && data.meta.title) {
            document.getElementById('pageTitle').textContent = data.meta.title;
            document.title = data.meta.title;
        }
        
        // Atualizar elementos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(data, key);
            if (translation) {
                // Preservar HTML se houver
                if (element.innerHTML.includes('<') && !element.getAttribute('data-i18n-raw')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Atualizar placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(data, key);
            if (translation) {
                element.placeholder = translation;
            }
        });
        
        // Notificar que a tradução foi aplicada
        this.loaded = true;
        this.callbacks.forEach(cb => cb(locale));
        
        console.log(`✅ Tradução aplicada: ${locale}`);
    },
    
    // Obter tradução aninhada
    getNestedTranslation: function(data, key) {
        const keys = key.split('.');
        let value = data;
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return null;
            }
        }
        return value || null;
    },
    
    // Mudar idioma
    changeLanguage: function(locale) {
        if (!this.availableLocales.includes(locale)) {
            console.error(`❌ Idioma não suportado: ${locale}`);
            return;
        }
        
        if (this.currentLocale === locale && this.translations[locale]) {
            return;
        }
        
        console.log(`🌍 Alterando idioma para: ${locale}`);
        this.loadTranslations(locale);
    },
    
    // Obter tradução atual
    getTranslation: function(key) {
        const data = this.translations[this.currentLocale];
        if (!data) return key;
        return this.getNestedTranslation(data, key) || key;
    },
    
    // Adicionar callback quando tradução for carregada
    onLoaded: function(callback) {
        if (this.loaded) {
            callback(this.currentLocale);
        } else {
            this.callbacks.push(callback);
        }
    }
};

// ============================================
// FUNÇÕES GLOBAIS PARA I18N
// ============================================

// Mudar idioma
function changeLanguage(locale) {
    I18N.changeLanguage(locale);
}

// Obter tradução
function __(key) {
    return I18N.getTranslation(key);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    I18N.init();
});
