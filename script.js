// ============================================
// CONFIGURAÇÕES INICIAIS
// ============================================

// Data atual
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', options);
    
    // Inicializa componentes
    initCookieConsent();
    initUserInfo();
    initTabs();
    initStats();
});

// ============================================
// COOKIE CONSENT
// ============================================
function initCookieConsent() {
    const cookieBanner = document.getElementById('cookieConsent');
    
    // Verifica se já aceitou
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieBanner.classList.add('active');
        }, 1500);
    }
    
    document.getElementById('cookieAcceptAll').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'all');
        cookieBanner.classList.remove('active');
    });
    
    document.getElementById('cookieRejectAll').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieBanner.classList.remove('active');
        document.getElementById('cookieAnalytics').checked = false;
        document.getElementById('cookieAdvertising').checked = false;
    });
    
    document.getElementById('cookieCustomize').addEventListener('click', function() {
        const analytics = document.getElementById('cookieAnalytics').checked;
        const advertising = document.getElementById('cookieAdvertising').checked;
        localStorage.setItem('cookieConsent', JSON.stringify({ analytics, advertising }));
        cookieBanner.classList.remove('active');
    });
}

// ============================================
// USER INFO (SIMULAÇÃO)
// ============================================
function initUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (user) {
        document.getElementById('userName').textContent = user.name || 'Usuário';
        document.getElementById('userEmail').textContent = user.email || 'usuario@email.com';
        document.getElementById('userAvatar').textContent = user.avatar || '👤';
        document.getElementById('btnLogout').style.display = 'block';
        document.getElementById('btnLogin').style.display = 'none';
        document.getElementById('userBadge').innerHTML = '<span style="background:#27ae60;color:#fff;padding:2px 10px;border-radius:30px;font-size:0.8rem;">✔ Verificado</span>';
    }
}

// ============================================
// LOGIN / LOGOUT
// ============================================
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

// Fechar modal com clique fora
document.getElementById('login-modal').addEventListener('click', function(e) {
    if (e.target === this) closeLoginModal();
});

document.getElementById('close-modal-btn').addEventListener('click', closeLoginModal);

// Login com Google (simulação)
document.getElementById('google-login-btn').addEventListener('click', function() {
    const user = {
        name: 'Usuário Google',
        email: 'usuario.google@gmail.com',
        avatar: '👤'
    };
    localStorage.setItem('user', JSON.stringify(user));
    closeLoginModal();
    location.reload();
});

// Login Convidado
document.getElementById('guest-login-modal-btn').addEventListener('click', function() {
    const user = {
        name: 'Convidado',
        email: 'convidado@wazzimagiygg.com',
        avatar: '👤'
    };
    localStorage.setItem('user', JSON.stringify(user));
    closeLoginModal();
    location.reload();
});

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

function logoutBanned() {
    localStorage.removeItem('user');
    document.getElementById('bannedOverlay').classList.remove('active');
    location.reload();
}

// ============================================
// NOTIFICAÇÕES
// ============================================
let notifications = [];

function toggleNotifications(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('active');
    
    // Simula notificações
    if (notifications.length === 0 && dropdown.classList.contains('active')) {
        notifications = [
            { id: 1, message: '📢 Novo artigo publicado!', read: false },
            { id: 2, message: '📚 Atualização no WikiWorld', read: false },
        ];
        renderNotifications();
        updateBadge();
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <span class="material-icons">notifications_off</span>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div style="padding:10px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:1.2rem;${n.read ? 'opacity:0.6;' : 'font-weight:600;'}">${n.message}</span>
            ${!n.read ? '<span style="background:#FE8A00;border-radius:50%;width:8px;height:8px;display:inline-block;"></span>' : ''}
        </div>
    `).join('');
}

function updateBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (unread > 0) {
        badge.style.display = 'block';
        badge.textContent = unread;
    } else {
        badge.style.display = 'none';
    }
}

function markAllAsRead(event) {
    event.stopPropagation();
    notifications = notifications.map(n => ({ ...n, read: true }));
    renderNotifications();
    updateBadge();
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function() {
    document.getElementById('notifDropdown').classList.remove('active');
});

// ============================================
// TABS / FILTROS
// ============================================
function initTabs() {
    // Ativa a primeira tab
    filterByTab('wikiworldweb');
}

function filterByTab(tab) {
    // Atualiza links ativos
    document.querySelectorAll('.nav-menu ul li a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.tab === tab) {
            link.classList.add('active');
        }
    });
    
    // Simula carregamento de conteúdo
    const mainCol = document.getElementById('main-col');
    const content = {
        'wikiworldweb': `
            <h2 style="font-size:2rem;color:#000b61;margin-bottom:15px;">🌐 WikiWorld</h2>
            <p style="font-size:1.4rem;line-height:1.8;color:#333;">
                Bem-vindo ao WikiWorld! Aqui você encontra artigos enciclopédicos 
                com a qualidade e confiabilidade que você merece.
            </p>
            <div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;">
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📖 Artigo 1</h3>
                    <p style="font-size:1.1rem;color:#666;">Descrição do artigo...</p>
                </div>
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📖 Artigo 2</h3>
                    <p style="font-size:1.1rem;color:#666;">Descrição do artigo...</p>
                </div>
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📖 Artigo 3</h3>
                    <p style="font-size:1.1rem;color:#666;">Descrição do artigo...</p>
                </div>
            </div>
        `,
        'materiadeensaio': `
            <h2 style="font-size:2rem;color:#000b61;margin-bottom:15px;">📚 Notícias</h2>
            <p style="font-size:1.4rem;line-height:1.8;color:#333;">
                Fique por dentro das últimas notícias e novidades do mundo acadêmico.
            </p>
            <div style="margin-top:20px;">
                <div style="padding:15px;border-bottom:1px solid #eee;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📰 Notícia 1</h3>
                    <p style="font-size:1.1rem;color:#666;">Resumo da notícia...</p>
                </div>
                <div style="padding:15px;border-bottom:1px solid #eee;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📰 Notícia 2</h3>
                    <p style="font-size:1.1rem;color:#666;">Resumo da notícia...</p>
                </div>
            </div>
        `,
        'academico': `
            <h2 style="font-size:2rem;color:#000b61;margin-bottom:15px;">🎓 Acadêmico</h2>
            <p style="font-size:1.4rem;line-height:1.8;color:#333;">
                Conteúdos acadêmicos para estudantes e pesquisadores.
            </p>
            <div style="margin-top:20px;">
                <div style="padding:15px;background:#f8f9fa;border-radius:8px;margin-bottom:10px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📚 Curso 1</h3>
                    <p style="font-size:1.1rem;color:#666;">Descrição do curso...</p>
                </div>
                <div style="padding:15px;background:#f8f9fa;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📚 Curso 2</h3>
                    <p style="font-size:1.1rem;color:#666;">Descrição do curso...</p>
                </div>
            </div>
        `,
        'materia': `
            <h2 style="font-size:2rem;color:#000b61;margin-bottom:15px;">📖 Matérias</h2>
            <p style="font-size:1.4rem;line-height:1.8;color:#333;">
                Matérias especiais e conteúdos exclusivos.
            </p>
            <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📝 Matéria 1</h3>
                    <p style="font-size:1.1rem;color:#666;">Resumo da matéria...</p>
                </div>
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                    <h3 style="font-size:1.4rem;color:#000b61;">📝 Matéria 2</h3>
                    <p style="font-size:1.1rem;color:#666;">Resumo da matéria...</p>
                </div>
            </div>
        `,
        'uwgbooks': `
            <h2 style="font-size:2rem;color:#000b61;margin-bottom:15px;">📘 UWG Books</h2>
            <p style="font-size:1.4rem;line-height:1.8;color:#333;">
                Biblioteca digital com livros e publicações da UWG.
            </p>
            <div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:15px;">
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
                    <span style="font-size:3rem;">📕</span>
                    <h3 style="font-size:1.2rem;color:#000b61;">Livro 1</h3>
                </div>
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
                    <span style="font-size:3rem;">📗</span>
                    <h3 style="font-size:1.2rem;color:#000b61;">Livro 2</h3>
                </div>
                <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
                    <span style="font-size:3rem;">📘</span>
                    <h3 style="font-size:1.2rem;color:#000b61;">Livro 3</h3>
                </div>
            </div>
        `
    };
    
    mainCol.innerHTML = content[tab] || '<p style="font-size:1.4rem;color:#666;">Conteúdo não encontrado.</p>';
}

// ============================================
// STATS (SIMULAÇÃO)
// ============================================
function initStats() {
    // Simula números aleatórios
    document.getElementById('total-wikiworld').textContent = Math.floor(Math.random() * 1000) + 100;
    document.getElementById('total-ensaio').textContent = Math.floor(Math.random() * 500) + 50;
    document.getElementById('total-academico').textContent = Math.floor(Math.random() * 300) + 30;
    document.getElementById('total-materia').textContent = Math.floor(Math.random() * 200) + 20;
    document.getElementById('total-uwgbooks').textContent = Math.floor(Math.random() * 100) + 10;
}

// ============================================
// SEARCH
// ============================================
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        alert(`🔍 Buscando por: "${query}"\n(Simulação de busca)`);
    } else {
        alert('Digite algo para buscar.');
    }
});

document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('search-btn').click();
    }
});

// ============================================
// SIDEBARS (SIMULAÇÃO)
// ============================================
document.getElementById('sidebar-left').innerHTML = `
    <h3 style="font-size:1.4rem;color:#000b61;margin-bottom:10px;">📌 Destaques</h3>
    <ul style="list-style:none;padding:0;">
        <li style="padding:8px 0;border-bottom:1px solid #eee;font-size:1.1rem;">🔹 Artigo em destaque</li>
        <li style="padding:8px 0;border-bottom:1px solid #eee;font-size:1.1rem;">🔹 Últimas atualizações</li>
        <li style="padding:8px 0;border-bottom:1px solid #eee;font-size:1.1rem;">🔹 Comunidade</li>
        <li style="padding:8px 0;font-size:1.1rem;">🔹 Eventos</li>
    </ul>
`;

document.getElementById('sidebar-right').innerHTML = `
    <h3 style="font-size:1.4rem;color:#000b61;margin-bottom:10px;">📊 Estatísticas</h3>
    <div style="font-size:1.2rem;line-height:2;">
        <div>👥 Usuários: ${Math.floor(Math.random() * 10000) + 1000}</div>
        <div>📄 Artigos: ${Math.floor(Math.random() * 5000) + 500}</div>
        <div>💬 Comentários: ${Math.floor(Math.random() * 2000) + 200}</div>
    </div>
    <hr style="margin:10px 0;border-color:#eee;">
    <h3 style="font-size:1.4rem;color:#000b61;margin-bottom:10px;">🏷️ Tags</h3>
    <div style="display:flex;flex-wrap:wrap;gap:5px;">
        <span style="background:#000b61;color:#fff;padding:4px 12px;border-radius:30px;font-size:0.9rem;">#Wiki</span>
        <span style="background:#FE8A00;color:#fff;padding:4px 12px;border-radius:30px;font-size:0.9rem;">#Notícias</span>
        <span style="background:#27ae60;color:#fff;padding:4px 12px;border-radius:30px;font-size:0.9rem;">#Acadêmico</span>
        <span style="background:#8e44ad;color:#fff;padding:4px 12px;border-radius:30px;font-size:0.9rem;">#Livros</span>
    </div>
`;
