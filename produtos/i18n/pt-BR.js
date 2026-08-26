// ===== PORTUGUÊS (BR) =====
(function() {
    const translations = {
        // Meta
        pageTitle: 'Produtos WazzimaGiygg - Conhecimento Livre para Todos',
        
        // Cookies
        cookieTitle: '🍪 Nós usamos cookies',
        cookieDesc: 'Este site utiliza cookies para melhorar sua experiência, analisar tráfego e exibir anúncios personalizados. Ao continuar navegando, você concorda com nossa ',
        cookieEssential: '🔒 Essenciais (obrigatórios)',
        cookieAnalytics: '📊 Análise de dados',
        cookieAdvertising: '🎯 Publicidade personalizada',
        cookieAccept: '✅ Aceitar Todos',
        cookieReject: '❌ Recusar Todos',
        cookieCustomize: '⚙️ Personalizar',

        // Header
        headerTitle: '🌐 Conhecimento Livre para Todos',
        headerTagline: 'Assim como a Wikimedia Foundation, acreditamos que o conhecimento deve ser gratuito, acessível e colaborativo.',
        statProducts: '6+',
        statProductsLabel: 'Produtos Gratuitos',
        statContentLabel: 'Conteúdo Livre',
        statGlobalLabel: 'Acesso Global',

        // Products Section
        productsTitle: '📦 Nossos Produtos',
        productsSubtitle: 'Todos os nossos serviços são 100% gratuitos e mantidos por doações da comunidade.',
        
        // Badges
        badgeFree: '✅ Gratuito',
        badgeLaunch: 'LANÇAMENTO',
        badgePopular: '⭐ POPULAR',
        badgeNew: 'NOVO',

        // Product 1 - Jornal
        product1Title: 'Jornal WazzimaGiygg',
        product1Desc: 'Portal de notícias independente com análises aprofundadas, reportagens exclusivas e conteúdo jornalístico de qualidade. Cobertura completa de política, economia, internacional, justiça, cultura e investigação.',
        product1Link: 'Acessar Jornal',

        // Product 2 - Bemtevi
        product2Title: 'Bemtevi',
        product2Desc: 'Rede social colaborativa inspirada no Twitter/X, mas com foco em comunidade, liberdade de expressão responsável e privacidade. Compartilhe ideias, interaja com usuários e construa sua rede de conhecimento.',
        product2Link: 'Acessar Bemtevi',

        // Product 3 - Maspia Forum
        product3Title: 'Maspia Forum',
        product3Desc: 'Uma comunidade colaborativa onde usuários podem discutir, compartilhar conhecimento e tirar dúvidas. Fórum moderno com categorias, subcategorias e sistema de reputação.',
        product3Link: 'Acessar Fórum',

        // Product 4 - WikiZero
        product4Title: 'WikiZero',
        product4Desc: 'Uma enciclopédia livre e colaborativa. Qualquer pessoa pode criar e editar artigos, contribuindo para o conhecimento coletivo. Inspirada na Wikipédia, mas com um toque único.',
        product4Link: 'Acessar Wiki',

        // Product 5 - Acadêmico
        product5Title: 'Acadêmico WazzimaGiygg',
        product5Desc: 'Plataforma dedicada à produção acadêmica e científica. Publique artigos, monografias, teses e compartilhe conhecimento com a comunidade acadêmica.',
        product5Link: 'Acessar Acadêmico',

        // Product 6 - Blog
        product6Title: 'Blog WazzimaGiygg',
        product6Desc: 'Plataforma de blogs onde qualquer usuário pode criar seu próprio espaço para publicar artigos, tutoriais, opiniões e compartilhar conhecimento com a comunidade. Editor HTML integrado com pré-visualização em tempo real, sistema de comentários e curtidas. Perfeito para quem quer ter seu próprio blog sem custos.',
        product6Link: 'Acessar Blog',

        // Features
        featuresTitle: '✨ Por que escolher nossos produtos?',
        feature1Title: '100% Gratuito',
        feature1Desc: 'Todos os nossos serviços são completamente gratuitos, sem planos pagos ou anúncios invasivos.',
        feature2Title: 'Colaborativo',
        feature2Desc: 'Qualquer pessoa pode contribuir, editar e melhorar o conteúdo disponível.',
        feature3Title: 'Privacidade',
        feature3Desc: 'Seus dados são protegidos e respeitamos integralmente a LGPD.',
        feature4Title: 'Acesso Global',
        feature4Desc: 'Disponível para qualquer pessoa, em qualquer lugar do mundo.',
        feature5Title: 'Rápido e Moderno',
        feature5Desc: 'Interfaces modernas, responsivas e otimizadas para todos os dispositivos.',
        feature6Title: 'Inovador',
        feature6Desc: 'Ferramentas únicas para criação e compartilhamento de conhecimento.',

        // Donation
        donationTitle: '💝 Ajude a manter o projeto vivo',
        donationDesc: 'O WazzimaGiygg é mantido por doações da comunidade. Seu apoio mantém nossos servidores no ar e permite que continuemos oferecendo serviços gratuitos para todos.',
        donationBtnText: 'Fazer Doação',
        supportBtnText: 'Contato por Ticket',

        // Transparency
        transparencyTitle: '📊 Transparência',
        transparencyDesc: 'Assim como a Wikimedia Foundation, acreditamos em transparência total. Todos os nossos códigos são abertos e as doações são utilizadas exclusivamente para manutenção e desenvolvimento dos serviços.',
        transparencyStat1: 'Recursos para manutenção',
        transparencyStat2: 'Anúncios ou Propaganda',
        transparencyStat3: 'Código e Conteúdo',

        // Footer
        footerAboutTitle: 'WazzimaGiygg',
        footerAboutDesc: 'Conhecimento livre para todos. Uma plataforma colaborativa inspirada na Wikimedia Foundation.',
        footerLinksTitle: 'Links Rápidos',
        footerLink1: 'Jornal',
        footerLink2: 'Bemtevi',
        footerLink3: 'Fórum',
        footerLink4: 'WikiZero',
        footerLink5: 'Blog',
        footerLegalTitle: 'Legal',
        footerLegal1: 'Política de Privacidade',
        footerLegal2: 'Termos de Uso',
        footerLegal3: 'Contato',
        footerSocialTitle: 'Redes Sociais',
        certLabel: '🤝 Desenvolvido com auxílio da plataforma',
        certSealLabel: 'Certificado',
        certThanks: 'Agradecemos à DeepSeek por fornecer assistência na construção deste projeto. A transparência e o reconhecimento são pilares do conhecimento livre.',
        footerCopyright: '© 2026 WazzimaGiygg · Conhecimento Livre para Todos',
        footerLove: 'Feito com ❤️ e IA'
    };

    // Registra as traduções
    if (typeof window.translations === 'undefined') {
        window.translations = {};
    }
    window.translations['pt-BR'] = translations;
})();
