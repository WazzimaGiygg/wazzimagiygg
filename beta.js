// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
    authDomain: "wzzm-ce3fc.firebaseapp.com",
    projectId: "wzzm-ce3fc",
    storageBucket: "wzzm-ce3fc.appspot.com",
    messagingSenderId: "249427877153",
    appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ============================================================
// FUNÇÃO PARA ADICIONAR UTM_SOURCE
// ============================================================

function getRedirectUrlWithUtm(baseUrl) {
    if (!baseUrl) return baseUrl;

    const sourceUrl = encodeURIComponent(window.location.href);

    if (baseUrl.includes('?')) {
        return `${baseUrl}&utm_source=${sourceUrl}`;
    } else {
        return `${baseUrl}?utm_source=${sourceUrl}`;
    }
}

// ============================================================
// SISTEMA DE IDIOMAS
// ============================================================

let currentLang = 'pt';
let currentReportData = null;
let safetyStatus = 'unknown';

function getBrowserLanguage() {
    const lang = navigator.language || navigator.languages[0] || 'pt';
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('es')) return 'es';
    return 'en';
}

function getTranslation(key) {
    const t = translations[currentLang] || translations.pt;
    const parts = key.split('.');
    let value = t;
    for (const part of parts) {
        if (value && value[part] !== undefined) {
            value = value[part];
        } else {
            value = null;
            break;
        }
    }
    return value || key;
}

function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    try {
        localStorage.setItem('preferred_language', lang);
    } catch (e) { /* ignora */ }

    applyTranslations(lang);

    if (currentReportData) {
        updateUIWithStatus(currentReportData);
    }
}

function applyTranslations(lang) {
    const t = translations[lang] || translations.pt;

    // Elementos específicos
    const elements = {
        'title': 'verifying',
        'statusBadge': 'statusUnknown',
        'urlLabel': 'target',
        'countdownLabel': 'redirectingIn',
        'countdownSecondsLabel': 'seconds',
        'continueBtnText': 'continue',
        'backBtnText': 'back',
        'reportBtnText': 'reportBtn',
        'alreadyReportedText': 'alreadyReported',
        'loginRequiredText': 'loginRequired',
        'reportTitle': 'reportTitle',
        'commentsTitle': 'commentsTitle',
        'modalTitleText': 'reportModalTitle',
        'reportFormDesc': 'reportFormDesc',
        'labelFakeNews': 'labelFakeNews',
        'labelFakeNewsDesc': 'labelFakeNewsDesc',
        'labelMalicious': 'labelMalicious',
        'labelMaliciousDesc': 'labelMaliciousDesc',
        'labelBroken': 'labelBroken',
        'labelBrokenDesc': 'labelBrokenDesc',
        'labelInappropriate': 'labelInappropriate',
        'labelInappropriateDesc': 'labelInappropriateDesc',
        'labelLgpd': 'labelLgpd',
        'labelLgpdDesc': 'labelLgpdDesc',
        'labelWikimedia': 'labelWikimedia',
        'labelWikimediaDesc': 'labelWikimediaDesc',
        'commentLabel': 'commentLabel',
        'submitReportText': 'submitReport',
        'loginRequiredTitle': 'loginRequiredTitle',
        'loginRequiredDesc': 'loginRequiredDesc',
        'loginGoogleBtn': 'loginGoogle',
        'loginModalTitle': 'loginModalTitle',
        'loginModalDesc': 'loginModalDesc',
        'bannedOverlayTitle': 'bannedOverlayTitle',
        'bannedOverlayDesc': 'bannedOverlayDesc',
        'bannedOverlayHelp': 'bannedOverlayHelp',
        'bannedLogoutBtn': 'bannedLogout',
        'infoText': 'infoText',
        'cancelBtnText': 'cancel',
        'modalCancelText': 'cancel',
        'loginModalGoogleBtn': 'loginGoogle',
        'loginModalCancelBtn': 'cancel',
        'submitReportBtn': 'submitReport'
    };

    for (const [id, key] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) {
            const value = getTranslation(key);
            if (value && value !== key) {
                el.textContent = value;
            }
        }
    }

    // Título da página
    const pageTitle = getTranslation('pageTitle');
    if (pageTitle) {
        document.title = pageTitle;
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = pageTitle;
    }

    // Confirm label (depende do status)
    const confirmLabel = document.getElementById('confirmLabel');
    if (confirmLabel && currentReportData) {
        const status = currentReportData.status || 'unknown';
        const confirmKey = {
            'safe': 'confirmSafe',
            'verified': 'confirmVerified',
            'danger': 'confirmDanger',
            'warning': 'confirmWarning',
            'broken': 'confirmBroken'
        } [status] || 'confirmSafe';
        confirmLabel.textContent = getTranslation(confirmKey);
    }
}

function initLanguage() {
    let preferredLang = null;
    try {
        preferredLang = localStorage.getItem('preferred_language');
    } catch (e) { /* ignora */ }

    if (!preferredLang || !translations[preferredLang]) {
        preferredLang = getBrowserLanguage();
    }

    setLanguage(preferredLang);
}

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

let currentUser = null;
let isLoggedIn = false;
let isBanned = false;
let banReason = '';
let banDetails = '';
let userIpHash = '';
let currentTargetUrl = '';
let currentDomain = '';
let redirectId = '';
let hasUserReported = false;
let isVerified = false;
let isBlocked = false;

// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    auth.signInWithPopup(provider)
        .then(result => {
            currentUser = result.user;
            isLoggedIn = true;
            showToast(getTranslation('reportSuccess'), 'success');
            closeLoginModal();
            closeReportModal();
            setTimeout(() => {
                openReportModal();
            }, 500);
        })
        .catch(error => {
            console.error('Erro ao fazer login:', error);
            showToast(getTranslation('reportError') + error.message, 'error');
        });
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('show');
}

function openReportModal() {
    if (isBanned) {
        const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
        showToast(`🚫 ${getTranslation('bannedWarning')} ${reasonText}. ${getTranslation('cannotReport')}`, 'error');
        return;
    }

    if (!isLoggedIn) {
        showToast('🔐 ' + getTranslation('loginToReport'), 'warning');
        return;
    }

    if (hasUserReported || isVerified) {
        showToast('⚠️ ' + getTranslation('alreadyReportedWarning'), 'warning');
        return;
    }

    document.getElementById('loginRequiredMessage').style.display = 'none';
    document.getElementById('reportFormContent').style.display = 'block';
    document.getElementById('reportModal').classList.add('show');

    // Reset form
    document.querySelectorAll('#reportModal input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('reportComment').value = '';

    applyTranslations(currentLang);
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-custom');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 400px;
        animation: slideUp 0.4s ease;
        background: ${type === 'success' ? '#16a34a' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#dc2626' : '#4f46e5'};
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ============================================================
// FUNÇÕES DE BANIMENTO
// ============================================================

let banCheckCache = {};

async function checkUserBanStatus(user) {
    if (!user) return false;

    const cacheKey = 'user_' + user.uid;
    if (banCheckCache[cacheKey] !== undefined) {
        return banCheckCache[cacheKey];
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().isBanned === true) {
            isBanned = true;
            banDetails = userDoc.data().banDetails || getTranslation('bannedReason');
            banReason = 'conta';
            banCheckCache[cacheKey] = true;
            return true;
        }
        banCheckCache[cacheKey] = false;
        return false;
    } catch (error) {
        console.error('Erro ao verificar banimento de usuário:', error);
        return false;
    }
}

async function checkIpBanStatus(ipHash) {
    if (!ipHash || ipHash === 'unknown') return false;

    const cacheKey = 'ip_' + ipHash;
    if (banCheckCache[cacheKey] !== undefined) {
        return banCheckCache[cacheKey];
    }

    try {
        const snapshot = await db.collection('ip_bans')
            .where('ipHash', '==', ipHash)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const banData = snapshot.docs[0].data();
            isBanned = true;
            banDetails = banData.banDetails || getTranslation('bannedReason');
            banReason = 'ip';
            banCheckCache[cacheKey] = true;
            return true;
        }
        banCheckCache[cacheKey] = false;
        return false;
    } catch (error) {
        console.error('Erro ao verificar banimento por IP:', error);
        return false;
    }
}

function showBannedOverlay() {
    const overlay = document.getElementById('bannedOverlay');
    const details = document.getElementById('banDetails');
    overlay.classList.add('show');
    const reasonText = banReason === 'ip' ? getTranslation('bannedIP') : getTranslation('account');
    details.textContent = `${banDetails || getTranslation('bannedReason')} (${reasonText} ${getTranslation('banned')})`;
    document.body.style.overflow = 'hidden';
}

function logoutBanned() {
    auth.signOut().then(() => {
        document.getElementById('bannedOverlay').classList.remove('show');
        document.body.style.overflow = 'auto';
        window.location.reload();
    }).catch(error => {
        console.error('Erro ao sair:', error);
    });
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function formatUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
    }
    return url;
}

function showError(message) {
    const errorBox = document.getElementById('errorBox');
    const errorMsg = document.getElementById('errorMessage');
    errorBox.classList.remove('hidden');
    errorMsg.textContent = message;

    const cd = document.getElementById('countdown');
    if (cd) cd.textContent = '⛔';

    const pf = document.getElementById('progressFill');
    if (pf) pf.style.width = '100%';

    const rb = document.getElementById('redirectBtn');
    if (rb) {
        rb.href = '#';
        rb.classList.add('btn-danger');
        rb.innerHTML = '<i class="fas fa-times"></i> ' + getTranslation('error');
        rb.disabled = true;
    }
}

function getStatusLabel(status) {
    const labels = {
        safe: getTranslation('statusSafe'),
        warning: getTranslation('statusWarning'),
        danger: getTranslation('statusDanger'),
        broken: getTranslation('statusBroken'),
        verified: getTranslation('statusVerified'),
        unknown: getTranslation('statusUnknown'),
        banned: getTranslation('statusBanned')
    };
    return labels[status] || getTranslation('statusUnknown');
}

// ============================================================
// FUNÇÃO PARA VERIFICAR SEGURANÇA DO SITE
// ============================================================

async function checkSiteSafety(domain, ipHash) {
    try {
        // Verificar se é um site da Wikimedia Foundation
        const wikimediaDomains = [
            'wikipedia.org', 'wikimedia.org', 'wiktionary.org',
            'wikisource.org', 'wikiquote.org', 'wikibooks.org',
            'wikiversity.org', 'wikidata.org', 'wikivoyage.org',
            'mediawiki.org', 'wikimediafoundation.org'
        ];

        const isWikimedia = wikimediaDomains.some(wmDomain => 
            domain.includes(wmDomain) || domain.endsWith(wmDomain)
        );

        if (isWikimedia) {
            return {
                status: 'blocked',
                reports: [],
                message: getTranslation('msgBlocked'),
                summary: {
                    total: 0,
                    fakeNews: 0,
                    malicious: 0,
                    broken: 0,
                    inappropriate: 0,
                    lgpd: 0,
                    wikimedia: 1,
                    recent: 0
                },
                moderationStatus: 'blocked',
                isVerified: false,
                moderationNotes: 'Redirecionamento não permitido para sites da Wikimedia Foundation.',
                isWikimediaBlocked: true
            };
        }

        const snapshot = await db.collection('site_reports')
            .where('domain', '==', domain)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const reports = [];
        snapshot.forEach(doc => {
            reports.push({ id: doc.id, ...doc.data() });
        });

        const modSnapshot = await db.collection('site_moderation')
            .where('domain', '==', domain)
            .limit(1)
            .get();

        let moderationStatus = 'pending';
        let moderationNotes = '';
        modSnapshot.forEach(doc => {
            const data = doc.data();
            moderationStatus = data.status || 'pending';
            moderationNotes = data.notes || '';
            isVerified = data.status === 'verified';
            isBlocked = data.status === 'blocked';
        });

        if (reports.length === 0 && moderationStatus === 'pending') {
            return {
                status: 'safe',
                reports: [],
                message: getTranslation('msgSafe'),
                moderationStatus: 'pending',
                isVerified: false
            };
        }

        if (ipHash) {
            const userReport = reports.find(r => r.ipHash === ipHash);
            hasUserReported = !!userReport;
        }

        let fakeNewsCount = 0, maliciousCount = 0, brokenCount = 0;
        let inappropriateCount = 0, lgpdCount = 0, wikimediaCount = 0;
        let totalReports = reports.length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReports = reports.filter(r => {
            if (r.timestamp) {
                const date = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
                return date >= thirtyDaysAgo;
            }
            return false;
        });

        reports.forEach(r => {
            if (r.reasons) {
                if (r.reasons.includes('fake_news')) fakeNewsCount++;
                if (r.reasons.includes('malicious')) maliciousCount++;
                if (r.reasons.includes('broken')) brokenCount++;
                if (r.reasons.includes('inappropriate')) inappropriateCount++;
                if (r.reasons.includes('lgpd_violation')) lgpdCount++;
                if (r.reasons.includes('wikimedia_blocked')) wikimediaCount++;
            }
        });

        if (moderationStatus === 'verified') {
            return {
                status: 'verified',
                reports: reports,
                message: getTranslation('msgVerified'),
                summary: {
                    total: totalReports,
                    fakeNews: fakeNewsCount,
                    malicious: maliciousCount,
                    broken: brokenCount,
                    inappropriate: inappropriateCount,
                    lgpd: lgpdCount,
                    wikimedia: wikimediaCount,
                    recent: recentReports.length
                },
                moderationStatus: 'verified',
                isVerified: true,
                moderationNotes: moderationNotes
            };
        }

        if (moderationStatus === 'blocked') {
            return {
                status: 'danger',
                reports: reports,
                message: getTranslation('msgBlocked'),
                summary: {
                    total: totalReports,
                    fakeNews: fakeNewsCount,
                    malicious: maliciousCount,
                    broken: brokenCount,
                    inappropriate: inappropriateCount,
                    lgpd: lgpdCount,
                    wikimedia: wikimediaCount,
                    recent: recentReports.length
                },
                moderationStatus: 'blocked',
                isVerified: false,
                moderationNotes: moderationNotes
            };
        }

        let status = 'safe';
        let message = '';

        if (recentReports.length > 0) {
            const brokenRecent = recentReports.filter(r => r.reasons && r.reasons.includes('broken')).length;
            if (brokenRecent / recentReports.length > 0.5) {
                status = 'broken';
                message = getTranslation('msgBroken');
            }
        }

        if (maliciousCount / totalReports > 0.3 || inappropriateCount / totalReports > 0.3) {
            status = 'danger';
            message = getTranslation('msgDanger');
        }

        if (fakeNewsCount / totalReports > 0.5 && status !== 'danger') {
            status = 'warning';
            message = getTranslation('msgFakeNews');
        }

        if (lgpdCount / totalReports > 0.3 && status !== 'danger') {
            status = 'warning';
            message = message || getTranslation('msgLgpd');
        }

        if (status === 'safe' && totalReports > 0) {
            status = 'warning';
            message = getTranslation('msgWarning');
        }

        if (!message && status !== 'safe') {
            message = getTranslation('msgWarning');
        }

        return {
            status: status,
            reports: reports,
            message: message || getTranslation('msgSafe'),
            summary: {
                total: totalReports,
                fakeNews: fakeNewsCount,
                malicious: maliciousCount,
                broken: brokenCount,
                inappropriate: inappropriateCount,
                lgpd: lgpdCount,
                wikimedia: wikimediaCount,
                recent: recentReports.length
            },
            moderationStatus: moderationStatus,
            isVerified: false,
            moderationNotes: moderationNotes
        };

    } catch (error) {
        console.error('Erro ao verificar segurança:', error);
        return { status: 'unknown', reports: [], message: getTranslation('errorDefault') };
    }
}

// ============================================================
// FUNÇÃO PARA ATUALIZAR A INTERFACE
// ============================================================

function updateUIWithStatus(statusData) {
    const status = isBanned ? 'banned' : statusData.status;
    safetyStatus = status;

    const t = translations[currentLang] || translations.pt;

    const icon = document.getElementById('warningIcon');
    const title = document.getElementById('title');
    const badge = document.getElementById('statusBadge');
    const warningText = document.getElementById('warningText');
    const confirmSection = document.getElementById('confirmSection');
    const confirmLabel = document.getElementById('confirmLabel');
    const countdownEl = document.getElementById('countdown');
    const progressFill = document.getElementById('progressFill');
    const redirectBtn = document.getElementById('redirectBtn');
    const reportInfo = document.getElementById('reportInfo');
    const reportContent = document.getElementById('reportContent');
    const reportBtn = document.getElementById('reportBtn');
    const alreadyReported = document.getElementById('alreadyReported');
    const loginRequiredBadge = document.getElementById('loginRequiredBadge');
    const countdownLabel = document.querySelector('.countdown-label');

    if (icon) { icon.className = 'warning-icon'; icon.classList.add(status); }
    if (title) { title.className = ''; title.classList.add(status); }
    if (badge) { badge.className = 'status-badge'; badge.classList.add(status); }
    if (warningText) { warningText.className = 'warning-text'; warningText.classList.add(status); }
    if (confirmSection) { confirmSection.className = 'confirm-section'; confirmSection.classList.add(status); }
    if (countdownEl) { countdownEl.className = 'countdown'; countdownEl.classList.add(status); }
    if (progressFill) { progressFill.className = 'progress-fill'; progressFill.classList.add(status); }

    if (isBanned) {
        const reasonText = banReason === 'ip' ? getTranslation('bannedIP') : getTranslation('account');
        if (icon) icon.textContent = '🚫';
        if (title) title.textContent = `🚫 ${reasonText.charAt(0).toUpperCase() + reasonText.slice(1)} ${getTranslation('banned')}`;
        if (badge) badge.textContent = '🚫 ' + getTranslation('accessBlocked');

        if (warningText) {
            warningText.innerHTML = `
                <p>
                    <strong>🔴 ${getTranslation('bannedReasonTitle')}</strong><br>
                    ${banDetails || getTranslation('bannedReason')}<br><br>
                    <small>${getTranslation('bannedContact')}</small>
                </p>
            `;
        }

        if (confirmLabel) confirmLabel.textContent = '⛔ ' + getTranslation('accessBlocked');
        if (confirmSection) confirmSection.style.opacity = '0.5';

        const confirmCheck = document.getElementById('confirmCheck');
        if (confirmCheck) confirmCheck.disabled = true;

        if (redirectBtn) {
            redirectBtn.className = 'btn btn-banned';
            redirectBtn.innerHTML = '<i class="fas fa-ban"></i> ' + getTranslation('accessBlocked');
            redirectBtn.href = '#';
            redirectBtn.style.pointerEvents = 'none';
            redirectBtn.disabled = true;
        }

        if (reportBtn) {
            reportBtn.className = 'report-btn banned';
            reportBtn.innerHTML = `<i class="fas fa-ban"></i> ${reasonText} ${getTranslation('banned')} - ${getTranslation('cannotReport')}`;
            reportBtn.style.pointerEvents = 'none';
            reportBtn.disabled = true;
        }

        if (alreadyReported) {
            alreadyReported.className = 'already-reported banned';
            alreadyReported.classList.remove('hidden');
            alreadyReported.innerHTML = `🚫 ${reasonText} ${getTranslation('banned')} - ${getTranslation('actionBlocked')}`;
        }

        if (loginRequiredBadge) loginRequiredBadge.classList.add('hidden');

        if (countdownLabel) countdownLabel.textContent = '⛔ ' + getTranslation('accessBlocked');
        if (countdownEl) countdownEl.textContent = '⛔';
        if (progressFill) progressFill.style.width = '100%';

        if (reportInfo) reportInfo.classList.add('hidden');

        // Bloquear checkbox de confirmação
        if (confirmCheck) confirmCheck.disabled = true;

        return;
    }

    // Status normais
    if (icon) {
        icon.textContent = status === 'safe' ? '✅' :
            status === 'warning' ? '⚠️' :
            status === 'danger' ? '🚨' :
            status === 'broken' ? '🔗' :
            status === 'verified' ? '🔵' : '❓';
    }

    if (title) {
        title.textContent = status === 'safe' ? '✅ ' + getTranslation('safeTitle') :
            status === 'warning' ? '⚠️ ' + getTranslation('warningTitle') :
            status === 'danger' ? '🚨 ' + getTranslation('dangerTitle') :
            status === 'broken' ? '🔗 ' + getTranslation('brokenTitle') :
            status === 'verified' ? '🔵 ' + getTranslation('verifiedTitle') :
            getTranslation('verifying');
    }

    if (badge) badge.textContent = getStatusLabel(status);

    if (status === 'verified' && statusData.moderationNotes) {
        if (warningText) {
            warningText.innerHTML = `
                <p>
                    <strong>🔵 ${getTranslation('verifiedByModeration')}</strong><br>
                    ${statusData.message}
                    <br><br>
                    <small>📝 ${getTranslation('moderatorNote')}: ${statusData.moderationNotes}</small>
                </p>
            `;
        }
    } else if (warningText) {
        warningText.innerHTML = `
            <p>
                <strong>${status === 'safe' ? '🟢' : status === 'warning' ? '🟡' : status === 'danger' ? '🔴' : status === 'broken' ? '🟣' : '🔵'}</strong>
                ${statusData.message}
                ${status !== 'safe' && status !== 'verified' ? '<br><br><small>' + getTranslation('basedOnReports') + '</small>' : ''}
            </p>
        `;
    }

    if (confirmLabel) {
        const confirmKey = {
            'safe': 'confirmSafe',
            'verified': 'confirmVerified',
            'danger': 'confirmDanger',
            'warning': 'confirmWarning',
            'broken': 'confirmBroken'
        } [status] || 'confirmSafe';
        confirmLabel.textContent = getTranslation(confirmKey);
    }

    if (redirectBtn) {
        redirectBtn.className = 'btn';
        if (status === 'danger') redirectBtn.classList.add('btn-danger');
        else if (status === 'warning') redirectBtn.classList.add('btn-warning');
        else if (status === 'safe') redirectBtn.classList.add('btn-success');
        else if (status === 'verified') redirectBtn.classList.add('btn-verified');
        else redirectBtn.classList.add('btn-primary');

        redirectBtn.href = getRedirectUrlWithUtm(currentTargetUrl);
        redirectBtn.disabled = false;
        redirectBtn.style.pointerEvents = 'auto';
    }

    // Relatório
    if (statusData.reports && statusData.reports.length > 0 && reportInfo && reportContent) {
        reportInfo.classList.remove('hidden');

        const summary = statusData.summary || {};

        let html = `
            <div class="report-item">
                <span class="label">${getTranslation('totalReports')}</span>
                <span class="value">${summary.total || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('fakeNewsCount')}</span>
                <span class="value ${summary.fakeNews > 0 ? 'danger' : 'safe'}">${summary.fakeNews || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('maliciousCount')}</span>
                <span class="value ${summary.malicious > 0 ? 'danger' : 'safe'}">${summary.malicious || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('brokenCount')}</span>
                <span class="value ${summary.broken > 0 ? 'warning' : 'safe'}">${summary.broken || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('inappropriateCount')}</span>
                <span class="value ${summary.inappropriate > 0 ? 'danger' : 'safe'}">${summary.inappropriate || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('lgpdCount')}</span>
                <span class="value ${summary.lgpd > 0 ? 'warning' : 'safe'}">${summary.lgpd || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('wikimediaCount')}</span>
                <span class="value ${summary.wikimedia > 0 ? 'danger' : 'safe'}">${summary.wikimedia || 0}</span>
            </div>
            <div class="report-item">
                <span class="label">${getTranslation('recentReports')}</span>
                <span class="value">${summary.recent || 0}</span>
            </div>
        `;
        reportContent.innerHTML = html;

        const commentsList = document.getElementById('commentsList');
        const commentsContainer = document.getElementById('reportComments');
        const comments = statusData.reports.filter(r => r.comment && r.comment.trim());

        if (comments.length > 0 && commentsContainer) {
            commentsContainer.classList.remove('hidden');
            if (commentsList) {
                commentsList.innerHTML = comments.map(c => `
                    <div class="comment">
                        <div>${c.comment}</div>
                        <div class="comment-meta">
                            <span>📅 ${c.timestamp ? new Date(c.timestamp.toDate ? c.timestamp.toDate() : c.timestamp).toLocaleDateString('pt-BR') : getTranslation('unknownDate')}</span>
                            <span>🔒 ${c.ipHash ? c.ipHash.substring(0, 8) + '...' : getTranslation('anonymous')}</span>
                        </div>
                    </div>
                `).join('');
            }
        } else if (commentsContainer) {
            commentsContainer.classList.add('hidden');
        }
    } else if (reportInfo) {
        reportInfo.classList.add('hidden');
    }

    // Botão de reportar
    if (reportBtn) {
        if (isBanned) {
            const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
            reportBtn.className = 'report-btn banned';
            reportBtn.innerHTML = `<i class="fas fa-ban"></i> ${reasonText} ${getTranslation('banned')} - ${getTranslation('cannotReport')}`;
            reportBtn.style.pointerEvents = 'none';
            reportBtn.disabled = true;
            if (alreadyReported) {
                alreadyReported.className = 'already-reported banned';
                alreadyReported.classList.remove('hidden');
                alreadyReported.innerHTML = `🚫 ${reasonText} ${getTranslation('banned')} - ${getTranslation('actionBlocked')}`;
            }
            if (loginRequiredBadge) loginRequiredBadge.classList.add('hidden');
        } else if (!isLoggedIn) {
            reportBtn.className = 'report-btn login-required';
            reportBtn.innerHTML = '<i class="fas fa-lock"></i> ' + getTranslation('loginToReport');
            reportBtn.style.pointerEvents = 'auto';
            reportBtn.disabled = false;
            if (alreadyReported) alreadyReported.classList.add('hidden');
            if (loginRequiredBadge) {
                loginRequiredBadge.classList.remove('hidden');
                loginRequiredBadge.innerHTML = '<i class="fas fa-lock"></i> ' + getTranslation('loginRequired');
            }
        } else if (status === 'verified' || (status === 'danger' && isBlocked) || statusData.isWikimediaBlocked) {
            reportBtn.className = 'report-btn disabled';
            reportBtn.innerHTML = '<i class="fas fa-check-circle"></i> ' + getTranslation('alreadyVerified');
            reportBtn.style.pointerEvents = 'none';
            reportBtn.disabled = true;
            if (alreadyReported) {
                alreadyReported.classList.remove('hidden');
                alreadyReported.innerHTML = '<i class="fas fa-check-circle"></i> ' + getTranslation('alreadyVerified');
            }
            if (loginRequiredBadge) loginRequiredBadge.classList.add('hidden');
        } else if (hasUserReported) {
            reportBtn.className = 'report-btn disabled';
            reportBtn.innerHTML = '<i class="fas fa-check-circle"></i> ' + getTranslation('alreadyReported');
            reportBtn.style.pointerEvents = 'none';
            reportBtn.disabled = true;
            if (alreadyReported) alreadyReported.classList.remove('hidden');
            if (loginRequiredBadge) loginRequiredBadge.classList.add('hidden');
        } else {
            reportBtn.className = 'report-btn';
            reportBtn.innerHTML = '<i class="fas fa-flag"></i> ' + getTranslation('reportBtn');
            reportBtn.style.pointerEvents = 'auto';
            reportBtn.disabled = false;
            if (alreadyReported) alreadyReported.classList.add('hidden');
            if (loginRequiredBadge) loginRequiredBadge.classList.add('hidden');
        }
    }

    if (status === 'danger' && (isBlocked || statusData.isWikimediaBlocked)) {
        if (countdownLabel) countdownLabel.textContent = '⛔ ' + getTranslation('redirectBlocked');
        if (countdownEl) countdownEl.textContent = '⛔';
        if (progressFill) progressFill.style.width = '100%';
        if (redirectBtn) {
            redirectBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + getTranslation('accessBlocked');
            redirectBtn.href = '#';
            redirectBtn.style.pointerEvents = 'none';
            redirectBtn.disabled = true;
        }
        const confirmCheck = document.getElementById('confirmCheck');
        if (confirmCheck) confirmCheck.disabled = true;
    } else if (redirectBtn) {
        redirectBtn.disabled = false;
        redirectBtn.style.pointerEvents = 'auto';
        redirectBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> ' + getTranslation('continue');
        redirectBtn.href = getRedirectUrlWithUtm(currentTargetUrl);

        const confirmCheck = document.getElementById('confirmCheck');
        if (confirmCheck) confirmCheck.disabled = false;
    }

    // Habilitar checkbox se não estiver bloqueado
    const confirmCheck = document.getElementById('confirmCheck');
    if (confirmCheck && status !== 'danger') {
        confirmCheck.disabled = false;
    }
}

// ============================================================
// FUNÇÃO PARA GERAR HASH DO IP
// ============================================================

async function getIpHash() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        const encoder = new TextEncoder();
        const data2 = encoder.encode(ip + 'wazzim-salt-2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data2);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.substring(0, 16);
    } catch {
        return 'unknown';
    }
}

// ============================================================
// FUNÇÃO PARA MANIPULAR CLIQUE NO BOTÃO DE REPORTAR
// ============================================================

function handleReportClick() {
    if (isBanned) {
        const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
        showToast(`🚫 ${getTranslation('bannedWarning')} ${reasonText}. ${getTranslation('cannotReport')}`, 'error');
        return;
    }

    if (!isLoggedIn) {
        document.getElementById('loginRequiredMessage').style.display = 'block';
        document.getElementById('reportFormContent').style.display = 'none';
        document.getElementById('reportModal').classList.add('show');
        applyTranslations(currentLang);
        return;
    }

    openReportModal();
}

// ============================================================
// FUNÇÃO PARA ENVIAR SINALIZAÇÃO
// ============================================================

async function submitReport() {
    if (isBanned) {
        const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
        showToast(`🚫 ${getTranslation('bannedWarning')} ${reasonText}. ${getTranslation('cannotReport')}`, 'error');
        closeReportModal();
        return;
    }

    if (!isLoggedIn) {
        showToast('🔐 ' + getTranslation('loginToReport'), 'warning');
        closeReportModal();
        return;
    }

    if (hasUserReported) {
        showToast('⚠️ ' + getTranslation('alreadyReportedWarning'), 'warning');
        closeReportModal();
        return;
    }

    const reasons = [];
    if (document.getElementById('reportFakeNews').checked) reasons.push('fake_news');
    if (document.getElementById('reportMalicious').checked) reasons.push('malicious');
    if (document.getElementById('reportBroken').checked) reasons.push('broken');
    if (document.getElementById('reportInappropriate').checked) reasons.push('inappropriate');
    if (document.getElementById('reportLgpd').checked) reasons.push('lgpd_violation');
    if (document.getElementById('reportWikimedia').checked) reasons.push('wikimedia_blocked');

    if (reasons.length === 0) {
        showToast('⚠️ ' + getTranslation('selectReason'), 'warning');
        return;
    }

    const comment = document.getElementById('reportComment').value.trim();

    try {
        const existingSnapshot = await db.collection('site_reports')
            .where('domain', '==', currentDomain)
            .where('userId', '==', currentUser.uid)
            .limit(1)
            .get();

        if (!existingSnapshot.empty) {
            showToast('⚠️ ' + getTranslation('alreadyReportedWarning'), 'warning');
            closeReportModal();
            return;
        }

        const newReportData = {
            domain: currentDomain,
            targetUrl: currentTargetUrl,
            reasons: reasons,
            comment: comment || '',
            ipHash: userIpHash,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email,
            userAgent: navigator.userAgent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            redirectId: redirectId
        };

        await db.collection('site_reports').add(newReportData);
        showToast('✅ ' + getTranslation('reportSuccess'), 'success');
        closeReportModal();

        hasUserReported = true;
        const newStatus = await checkSiteSafety(currentDomain, userIpHash);
        currentReportData = newStatus;
        updateUIWithStatus(newStatus);

    } catch (error) {
        console.error('Erro ao enviar sinalização:', error);
        showToast('❌ ' + getTranslation('reportError') + error.message, 'error');
    }
}

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

async function initRedirectWarning() {
    const isBannedNow = await checkUserBanStatus(currentUser);
    if (isBannedNow) {
        showBannedOverlay();
        updateUIWithStatus({ status: 'banned', message: getTranslation('bannedMessage'), reports: [] });
        return;
    }

    let targetUrl = getUrlParameter('uid') || getUrlParameter('url');

    if (!targetUrl) {
        showError(getTranslation('errorNoTarget'));
        return;
    }

    if (!isValidUrl(targetUrl) && !targetUrl.includes('.')) {
        showError(getTranslation('errorInvalidUrl') + '"' + targetUrl + '"');
        return;
    }

    const formattedUrl = formatUrl(targetUrl);
    const domain = extractDomain(formattedUrl);
    currentTargetUrl = formattedUrl;
    currentDomain = domain;

    const targetDisplay = document.getElementById('targetUrlDisplay');
    if (targetDisplay) {
        targetDisplay.textContent = formattedUrl;
    }

    redirectId = Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);

    const redirectIdEl = document.getElementById('redirectId');
    if (redirectIdEl) {
        redirectIdEl.textContent = redirectId;
    }

    try {
        const docData = {
            targetUrl: formattedUrl,
            domain: domain,
            userAgent: navigator.userAgent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            referrer: document.referrer || 'direct',
            status: 'pending'
        };
        await db.collection('redirectwarning').doc(redirectId).set(docData);
        console.log('✅ Redirecionamento registrado no Firebase:', redirectId);
    } catch (error) {
        console.error('❌ Erro ao salvar no Firebase:', error);
    }

    userIpHash = await getIpHash();

    const ipBanned = await checkIpBanStatus(userIpHash);
    if (ipBanned) {
        showBannedOverlay();
        updateUIWithStatus({ status: 'banned', message: getTranslation('ipBannedMessage'), reports: [] });
        return;
    }

    const statusData = await checkSiteSafety(domain, userIpHash);
    currentReportData = statusData;
    updateUIWithStatus(statusData);

    // Verificar se é um site da Wikimedia bloqueado
    const isWikimediaBlocked = statusData.isWikimediaBlocked || false;

    const delayTime = (status === 'danger' || isWikimediaBlocked) ? 0 : status === 'verified' ? 5 : 10;
    let countdown = delayTime;

    const countdownElement = document.getElementById('countdown');
    const progressFill = document.getElementById('progressFill');
    const confirmCheck = document.getElementById('confirmCheck');
    const redirectBtn = document.getElementById('redirectBtn');
    const countdownLabel = document.querySelector('.countdown-label');

    if (redirectBtn) {
        redirectBtn.href = getRedirectUrlWithUtm(formattedUrl);
    }

    function performRedirect() {
        db.collection('redirectwarning').doc(redirectId).update({
            status: 'redirected',
            redirectedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error('Erro ao atualizar status:', err));

        window.location.href = getRedirectUrlWithUtm(currentTargetUrl);
    }

    function updateCountdown() {
        countdown--;
        const cdEl = document.getElementById('countdown');
        if (cdEl) {
            cdEl.textContent = countdown;
        }

        if (progressFill) {
            const progress = delayTime > 0 ? ((delayTime - countdown) / delayTime) * 100 : 100;
            progressFill.style.width = Math.min(progress, 100) + '%';
        }

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (confirmCheck && confirmCheck.checked && status !== 'danger' && !isBanned && !isWikimediaBlocked) {
                performRedirect();
            } else if (status === 'danger' || isWikimediaBlocked) {
                if (cdEl) cdEl.textContent = '⛔';
                if (countdownLabel) countdownLabel.textContent = getTranslation('accessBlocked');
                if (progressFill) progressFill.style.width = '100%';
            } else if (isBanned) {
                if (cdEl) cdEl.textContent = '⛔';
                if (countdownLabel) countdownLabel.textContent = getTranslation('accountBanned');
                if (progressFill) progressFill.style.width = '100%';
            } else {
                if (cdEl) cdEl.textContent = '⏸';
                if (countdownLabel) countdownLabel.textContent = getTranslation('awaitingConfirmation');
                if (progressFill) progressFill.style.width = '100%';
                if (redirectBtn) {
                    redirectBtn.classList.add('btn-danger');
                    redirectBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + getTranslation('confirmToContinue');
                    redirectBtn.href = '#';
                    redirectBtn.style.pointerEvents = 'none';
                    redirectBtn.disabled = true;
                }
            }
        }
    }

    let countdownInterval = setInterval(updateCountdown, 1000);
    if (progressFill) {
        progressFill.style.width = '0%';
    }

    if (confirmCheck) {
        confirmCheck.addEventListener('change', function() {
            if (isBanned) {
                this.checked = false;
                const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
                showToast(`⚠️ ${getTranslation('bannedWarning')} ${reasonText}. ${getTranslation('cannotContinue')}`, 'error');
                return;
            }

            if (isWikimediaBlocked) {
                this.checked = false;
                showToast('⚠️ ' + getTranslation('redirectBlocked') + ' - Wikimedia Foundation', 'error');
                return;
            }

            if (this.checked && countdown <= 0 && status !== 'danger') {
                performRedirect();
            } else if (this.checked && status !== 'danger') {
                if (countdownLabel) countdownLabel.textContent = getTranslation('redirectingIn');
                if (redirectBtn) {
                    redirectBtn.className = 'btn';
                    if (status === 'verified') {
                        redirectBtn.classList.add('btn-verified');
                    } else {
                        redirectBtn.classList.add('btn-primary');
                    }
                    redirectBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> ' + getTranslation('continue');
                    redirectBtn.href = getRedirectUrlWithUtm(currentTargetUrl);
                    redirectBtn.style.pointerEvents = 'auto';
                    redirectBtn.disabled = false;
                }
            } else if (status === 'danger') {
                this.checked = true;
                showToast('⚠️ ' + getTranslation('dangerWarning'), 'warning');
            } else if (isWikimediaBlocked) {
                this.checked = false;
                showToast('⚠️ ' + getTranslation('redirectBlocked'), 'error');
            }
        });
    }

    if (redirectBtn) {
        redirectBtn.addEventListener('click', function(e) {
            if (isBanned) {
                e.preventDefault();
                const reasonText = banReason === 'ip' ? 'IP' : getTranslation('account');
                showToast(`⚠️ ${getTranslation('bannedWarning')} ${reasonText}. ${getTranslation('cannotContinue')}`, 'error');
                return;
            }

            if (isWikimediaBlocked) {
                e.preventDefault();
                showToast('⚠️ ' + getTranslation('redirectBlocked') + ' - Wikimedia Foundation', 'error');
                return;
            }

            if (!confirmCheck || !confirmCheck.checked && status !== 'danger') {
                e.preventDefault();
                const confirmSection = document.querySelector('.confirm-section');
                if (confirmSection) {
                    confirmSection.style.borderColor = '#ef4444';
                    confirmSection.style.background = '#fef2f2';
                    setTimeout(() => {
                        confirmSection.style.borderColor = status === 'warning' ? '#fcd34d' :
                            status === 'verified' ? '#93c5fd' : '#bbf7d0';
                        confirmSection.style.background = status === 'warning' ? '#fffbeb' :
                            status === 'verified' ? '#eff6ff' : '#f0fdf4';
                    }, 2000);
                }
                return;
            }
            if (status === 'danger' && isBlocked) {
                e.preventDefault();
                showToast('⚠️ ' + getTranslation('blockedWarning'), 'error');
                return;
            }
            clearInterval(countdownInterval);
            performRedirect();
        });
    }

    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
}

// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initLanguage();

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .toast-custom {
            animation: slideUp 0.4s ease;
        }
    `;
    document.head.appendChild(style);

    auth.onAuthStateChanged(async function(user) {
        currentUser = user;
        isLoggedIn = !!user;

        if (user) {
            userIpHash = await getIpHash();
            const userBanned = await checkUserBanStatus(user);
            if (userBanned) {
                showBannedOverlay();
                updateUIWithStatus({ status: 'banned', message: getTranslation('bannedMessage'), reports: [] });
                return;
            }
        } else {
            userIpHash = await getIpHash();
            const ipBanned = await checkIpBanStatus(userIpHash);
            if (ipBanned) {
                showBannedOverlay();
                updateUIWithStatus({ status: 'banned', message: getTranslation('ipBannedMessage'), reports: [] });
                return;
            }
        }

        initRedirectWarning();
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeReportModal();
        closeLoginModal();
    }
});

// ============================================================
// EXPOR FUNÇÕES GLOBALMENTE
// ============================================================

window.setLanguage = setLanguage;
window.initLanguage = initLanguage;
window.handleReportClick = handleReportClick;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
window.submitReport = submitReport;
window.loginWithGoogle = loginWithGoogle;
window.closeLoginModal = closeLoginModal;
window.showLoginModal = showLoginModal;
window.logoutBanned = logoutBanned;
window.showToast = showToast;
window.getTranslation = getTranslation;
window.getRedirectUrlWithUtm = getRedirectUrlWithUtm;

console.log('🔒 Sistema de Redirecionamento com Verificação de Segurança');
console.log('🌐 Idiomas disponíveis: Português, Inglês, Espanhol');
console.log('📋 ' + Object.keys(translations).length + ' idiomas carregados');
console.log('📊 utm_source será adicionado automaticamente ao redirecionar');
console.log('🚫 Bloqueio automático para sites da Wikimedia Foundation');
console.log('🔐 Usuários bloqueados não podem reportar');
