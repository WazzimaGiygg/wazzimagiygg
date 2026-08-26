// ===== DEUTSCH =====
(function() {
    const translations = {
        pageTitle: 'WazzimaGiygg Produkte - Freies Wissen für Alle',
        
        cookieTitle: '🍪 Wir verwenden Cookies',
        cookieDesc: 'Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern, den Verkehr zu analysieren und personalisierte Anzeigen anzuzeigen. Durch die weitere Nutzung stimmen Sie unserer ',
        cookieEssential: '🔒 Essenziell (erforderlich)',
        cookieAnalytics: '📊 Datenanalyse',
        cookieAdvertising: '🎯 Personalisierte Werbung',
        cookieAccept: '✅ Alle Akzeptieren',
        cookieReject: '❌ Alle Ablehnen',
        cookieCustomize: '⚙️ Anpassen',

        headerTitle: '🌐 Freies Wissen für Alle',
        headerTagline: 'Wie die Wikimedia Foundation glauben wir, dass Wissen kostenlos, zugänglich und kollaborativ sein sollte.',
        statProducts: '6+',
        statProductsLabel: 'Kostenlose Produkte',
        statContentLabel: 'Freier Inhalt',
        statGlobalLabel: 'Globaler Zugang',

        productsTitle: '📦 Unsere Produkte',
        productsSubtitle: 'Alle unsere Dienstleistungen sind 100% kostenlos und werden durch Spenden der Community unterstützt.',
        
        badgeFree: '✅ Kostenlos',
        badgeLaunch: 'START',
        badgePopular: '⭐ BELIEBT',
        badgeNew: 'NEU',

        product1Title: 'WazzimaGiygg Zeitung',
        product1Desc: 'Unabhängiges Nachrichtenportal mit vertiefenden Analysen, exklusiven Berichten und qualitativ hochwertigem Journalismus. Vollständige Berichterstattung über Politik, Wirtschaft, Internationales, Justiz, Kultur und Ermittlungen.',
        product1Link: 'Zur Zeitung',

        product2Title: 'Bemtevi',
        product2Desc: 'Kollaboratives soziales Netzwerk, inspiriert von Twitter/X, aber mit Fokus auf Gemeinschaft, verantwortungsvolle Meinungsfreiheit und Privatsphäre. Teilen Sie Ideen, interagieren Sie mit Nutzern und bauen Sie Ihr Wissensnetzwerk auf.',
        product2Link: 'Zu Bemtevi',

        product3Title: 'Maspia Forum',
        product3Desc: 'Eine kollaborative Community, in der Nutzer diskutieren, Wissen teilen und Fragen stellen können. Modernes Forum mit Kategorien, Unterkategorien und Reputationssystem.',
        product3Link: 'Zum Forum',

        product4Title: 'WikiZero',
        product4Desc: 'Eine freie und kollaborative Enzyklopädie. Jeder kann Artikel erstellen und bearbeiten und so zum kollektiven Wissen beitragen. Inspiriert von Wikipedia, aber mit einer einzigartigen Note.',
        product4Link: 'Zur Wiki',

        product5Title: 'Akademisches WazzimaGiygg',
        product5Desc: 'Plattform für akademische und wissenschaftliche Produktion. Veröffentlichen Sie Artikel, Monografien, Dissertationen und teilen Sie Wissen mit der akademischen Gemeinschaft.',
        product5Link: 'Zum Akademischen',

        product6Title: 'WazzimaGiygg Blog',
        product6Desc: 'Blog-Plattform, auf der jeder Nutzer seinen eigenen Bereich erstellen kann, um Artikel, Tutorials, Meinungen zu veröffentlichen und Wissen mit der Community zu teilen. Integrierter HTML-Editor mit Echtzeit-Vorschau, Kommentarsystem und Likes. Perfekt für alle, die ihren eigenen Blog ohne Kosten haben möchten.',
        product6Link: 'Zum Blog',

        featuresTitle: '✨ Warum unsere Produkte wählen?',
        feature1Title: '100% Kostenlos',
        feature1Desc: 'Alle unsere Dienste sind vollständig kostenlos, ohne kostenpflichtige Tarife oder aufdringliche Werbung.',
        feature2Title: 'Kollaborativ',
        feature2Desc: 'Jeder kann zum verfügbaren Inhalt beitragen, ihn bearbeiten und verbessern.',
        feature3Title: 'Datenschutz',
        feature3Desc: 'Ihre Daten sind geschützt und wir halten uns vollständig an die LGPD.',
        feature4Title: 'Globaler Zugang',
        feature4Desc: 'Verfügbar für jeden, überall auf der Welt.',
        feature5Title: 'Schnell und Modern',
        feature5Desc: 'Moderne, responsive und für alle Geräte optimierte Oberflächen.',
        feature6Title: 'Innovativ',
        feature6Desc: 'Einzigartige Werkzeuge zur Erstellung und Weitergabe von Wissen.',

        donationTitle: '💝 Helfen Sie, das Projekt am Leben zu erhalten',
        donationDesc: 'WazzimaGiygg wird durch Spenden der Community unterstützt. Ihre Unterstützung hält unsere Server am Laufen und ermöglicht es uns, weiterhin kostenlose Dienste für alle anzubieten.',
        donationBtnText: 'Spenden',
        supportBtnText: 'Kontakt per Ticket',

        transparencyTitle: '📊 Transparenz',
        transparencyDesc: 'Wie die Wikimedia Foundation glauben wir an vollständige Transparenz. Unser gesamter Code ist offen und Spenden werden ausschließlich für die Wartung und Entwicklung der Dienste verwendet.',
        transparencyStat1: 'Ressourcen für Wartung',
        transparencyStat2: 'Anzeigen oder Werbung',
        transparencyStat3: 'Offener Code und Inhalt',

        footerAboutTitle: 'WazzimaGiygg',
        footerAboutDesc: 'Freies Wissen für alle. Eine kollaborative Plattform, inspiriert von der Wikimedia Foundation.',
        footerLinksTitle: 'Schnelllinks',
        footerLink1: 'Zeitung',
        footerLink2: 'Bemtevi',
        footerLink3: 'Forum',
        footerLink4: 'WikiZero',
        footerLink5: 'Blog',
        footerLegalTitle: 'Rechtliches',
        footerLegal1: 'Datenschutzrichtlinie',
        footerLegal2: 'Nutzungsbedingungen',
        footerLegal3: 'Kontakt',
        footerSocialTitle: 'Soziale Medien',
        certLabel: '🤝 Entwickelt mit Unterstützung von',
        certSealLabel: 'Zertifiziert',
        certThanks: 'Wir danken DeepSeek für die Unterstützung beim Aufbau dieses Projekts. Transparenz und Anerkennung sind Säulen des freien Wissens.',
        footerCopyright: '© 2026 WazzimaGiygg · Freies Wissen für Alle',
        footerLove: 'Gemacht mit ❤️ und KI'
    };

    if (typeof window.translations === 'undefined') {
        window.translations = {};
    }
    window.translations['de-DE'] = translations;
})();
