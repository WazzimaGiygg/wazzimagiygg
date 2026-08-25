// ============================================
// I18N - Motor de Internacionalização
// ============================================

const I18N = {
    currentLocale: 'pt',
    availableLocales: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru', 'ar', 'hi', 'el'],
    translations: {},
    loaded: false,
    callbacks: [],
    
    // Mapeamento para o sistema de detecção de idioma
    languageMap: {
        'pt': 'Português',
        'en': 'Inglês',
        'es': 'Espanhol',
        'fr': 'Francês',
        'de': 'Alemão',
        'it': 'Italiano',
        'ja': 'Japonês',
        'zh': 'Chinês',
        'ru': 'Russo',
        'ar': 'Árabe',
        'hi': 'Hindi',
        'el': 'Grego'
    },
    
    init: function() {
        console.log('🌍 Inicializando sistema de internacionalização...');
        
        // 1. Verificar se há preferência salva no sistema de idioma
        const savedLangCode = localStorage.getItem('user_preferred_language');
        if (savedLangCode) {
            const locale = this.getLocaleFromCode(savedLangCode);
            if (locale && this.availableLocales.includes(locale)) {
                this.currentLocale = locale;
                console.log(`🌍 Usando preferência salva do sistema de idioma: ${savedLangCode} → ${locale}`);
            }
        }
        
        // 2. Se não houver preferência, detectar do navegador
        if (!this.currentLocale) {
            const detected = this.detectLanguage();
            this.currentLocale = detected;
            console.log(`🌍 Idioma detectado: ${detected}`);
        }
        
        // 3. Salvar a preferência nos dois sistemas
        const langName = this.languageMap[this.currentLocale] || 'Português';
        const langCode = this.getCodeFromLocale(this.currentLocale);
        if (langCode) {
            localStorage.setItem('user_preferred_language', langCode);
            localStorage.setItem('wzzm_language', this.currentLocale);
        }
        
        // 4. Carregar traduções
        this.loadTranslations(this.currentLocale);
    },
    
    getLocaleFromCode: function(code) {
        const map = {
            'pt': 'pt', 'pt-BR': 'pt', 'pt-PT': 'pt',
            'en': 'en', 'en-US': 'en', 'en-GB': 'en',
            'es': 'es', 'es-ES': 'es', 'es-MX': 'es',
            'fr': 'fr', 'fr-FR': 'fr',
            'de': 'de', 'de-DE': 'de',
            'it': 'it', 'it-IT': 'it',
            'ja': 'ja', 'ja-JP': 'ja',
            'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh',
            'ru': 'ru', 'ru-RU': 'ru',
            'ar': 'ar', 'ar-SA': 'ar',
            'hi': 'hi', 'hi-IN': 'hi',
            'el': 'el', 'el-GR': 'el'
        };
        return map[code] || null;
    },
    
    getCodeFromLocale: function(locale) {
        const map = {
            'pt': 'pt',
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'ja': 'ja',
            'zh': 'zh',
            'ru': 'ru',
            'ar': 'ar',
            'hi': 'hi',
            'el': 'el'
        };
        return map[locale] || null;
    },
    
    detectLanguage: function() {
        const languages = navigator.languages || [navigator.language];
        for (const lang of languages) {
            const locale = lang.split('-')[0].toLowerCase();
            if (this.availableLocales.includes(locale)) {
                return locale;
            }
        }
        return 'pt';
    },
    
    loadTranslations: function(locale) {
        const self = this;
        
        if (this.translations[locale]) {
            this.applyTranslations(locale);
            return;
        }
        
        const script = document.createElement('script');
        script.src = `i18n/${locale}.js`;
        script.onload = function() {
            if (window[`i18n_${locale}`]) {
                self.translations[locale] = window[`i18n_${locale}`];
                self.applyTranslations(locale);
            } else {
                console.error(`❌ Tradução para ${locale} não encontrada`);
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
    
    applyTranslations: function(locale) {
        const data = this.translations[locale];
        if (!data) {
            console.error(`❌ Tradução para ${locale} não disponível`);
            return;
        }
        
        this.currentLocale = locale;
        localStorage.setItem('wzzm_language', locale);
        
        // Sincronizar com o sistema de detecção de idioma
        const langCode = this.getCodeFromLocale(locale);
        if (langCode) {
            localStorage.setItem('user_preferred_language', langCode);
        }
        
        // Atualizar seletor de idioma
        const select = document.getElementById('languageSelect');
        if (select) {
            const langName = this.languageMap[locale] || 'Português';
            select.value = langName;
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
        
        this.loaded = true;
        this.callbacks.forEach(cb => cb(locale));
        
        console.log(`✅ Tradução aplicada: ${locale}`);
    },
    
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
    
    changeLanguage: function(locale) {
        // Verificar se locale é um nome de idioma ou código
        let localeCode = locale;
        
        // Mapeamento de nomes para códigos
        const nameToCodeMap = {
            'Português': 'pt',
            'Inglês': 'en',
            'Espanhol': 'es',
            'Francês': 'fr',
            'Alemão': 'de',
            'Italiano': 'it',
            'Japonês': 'ja',
            'Chinês': 'zh',
            'Russo': 'ru',
            'Árabe': 'ar',
            'Hindi': 'hi',
            'Grego': 'el'
        };
        
        // Se for um nome de idioma, converter para código
        if (nameToCodeMap[locale]) {
            localeCode = nameToCodeMap[locale];
            console.log(`🌍 Convertendo nome "${locale}" para código "${localeCode}"`);
        }
        
        // Verificar se o código é suportado
        if (!this.availableLocales.includes(localeCode)) {
            console.error(`❌ Idioma não suportado: ${locale} (código: ${localeCode})`);
            console.log(`📋 Idiomas disponíveis: ${this.availableLocales.join(', ')}`);
            return;
        }
        
        if (this.currentLocale === localeCode && this.translations[localeCode]) {
            return;
        }
        
        console.log(`🌍 Alterando idioma para: ${localeCode}`);
        this.loadTranslations(localeCode);
    },
    
    getTranslation: function(key) {
        const data = this.translations[this.currentLocale];
        if (!data) return key;
        return this.getNestedTranslation(data, key) || key;
    },
    
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

// Função global para mudar idioma (chamada pelo HTML)
window.changeLanguage = function(locale) {
    console.log(`🌍 changeLanguage chamado com: ${locale}`);
    I18N.changeLanguage(locale);
};

// Função global para obter tradução
window.__ = function(key) {
    return I18N.getTranslation(key);
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando I18N...');
    I18N.init();
});
