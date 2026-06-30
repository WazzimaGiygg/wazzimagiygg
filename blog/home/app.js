// app.js
// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collection references
const postsCollection = db.collection('wikiworldweb').doc('posts').collection('all');
const settingsCollection = db.collection('wikiworldweb').doc('settings');
const mediaCollection = db.collection('wikiworldweb').doc('media').collection('files');

// State
let currentSection = 'posts';
let editingPostId = null;
let posts = [];

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const postsContainer = document.getElementById('postsContainer');
const postModal = document.getElementById('postModal');
const modalTitle = document.getElementById('modalTitle');
const postForm = document.getElementById('postForm');
const postId = document.getElementById('postId');
const postTitle = document.getElementById('postTitle');
const postCategory = document.getElementById('postCategory');
const postContent = document.getElementById('postContent');
const postImage = document.getElementById('postImage');
const postStatus = document.getElementById('postStatus');
const postDate = document.getElementById('postDate');
const savePostBtn = document.getElementById('savePostBtn');
const cancelModal = document.getElementById('cancelModal');
const closeModal = document.getElementById('closeModal');
const newPostBtn = document.getElementById('newPostBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');
const siteTitle = document.getElementById('siteTitle');
const siteDescription = document.getElementById('siteDescription');
const siteLogo = document.getElementById('siteLogo');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const totalPosts = document.getElementById('totalPosts');

// Navigation
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        showSection(section);
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

function showSection(section) {
    currentSection = section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    
    if (section === 'posts') loadPosts();
    if (section === 'analytics') loadAnalytics();
    if (section === 'media') loadMedia();
}

// Toggle Sidebar
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
    }
});

// Load Posts
async function loadPosts() {
    try {
        let query = postsCollection.orderBy('createdAt', 'desc');
        const snapshot = await query.get();
        posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        renderPosts();
        updateStats();
    } catch (error) {
        console.error('Error loading posts:', error);
        showToast('Erro ao carregar postagens', 'error');
    }
}

function renderPosts() {
    const filterStatus = statusFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    const filterCategory = categoryFilter.value;

    let filtered = posts.filter(post => {
        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                             post.content.toLowerCase().includes(searchTerm);
        const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
        return matchesStatus && matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma postagem encontrada</p>
                <button class="btn-primary" onclick="openNewPost()">
                    <i class="fas fa-plus"></i>
                    Criar primeira postagem
                </button>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = filtered.map(post => `
        <div class="post-card" data-id="${post.id}">
            <div class="post-info">
                <h3 onclick="editPost('${post.id}')">${post.title || 'Sem título'}</h3>
                <div class="post-meta">
                    <span>${post.category || 'Sem categoria'}</span>
                    <span>${formatDate(post.publishedDate || post.createdAt)}</span>
                    <span class="status ${post.status || 'draft'}">${post.status || 'Rascunho'}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="edit-btn" onclick="editPost('${post.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deletePost('${post.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Filter and Search
searchInput.addEventListener('input', renderPosts);
statusFilter.addEventListener('change', renderPosts);
categoryFilter.addEventListener('change', renderPosts);

// Open New Post Modal
function openNewPost() {
    editingPostId = null;
    modalTitle.textContent = 'Nova Postagem';
    postForm.reset();
    postId.value = '';
    postDate.value = new Date().toISOString().slice(0, 16);
    postModal.classList.add('active');
}

newPostBtn.addEventListener('click', openNewPost);

// Edit Post
async function editPost(id) {
    try {
        const doc = await postsCollection.doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            editingPostId = id;
            modalTitle.textContent = 'Editar Postagem';
            postId.value = id;
            postTitle.value = data.title || '';
            postCategory.value = data.category || '';
            postContent.value = data.content || '';
            postImage.value = data.image || '';
            postStatus.value = data.status || 'draft';
            postDate.value = data.publishedDate ? new Date(data.publishedDate).toISOString().slice(0, 16) : '';
            postModal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showToast('Erro ao carregar postagem', 'error');
    }
}

// Save Post
savePostBtn.addEventListener('click', async () => {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    if (!title || !content) {
        showToast('Preencha título e conteúdo', 'error');
        return;
    }

    const postData = {
        title,
        content,
        category: postCategory.value.trim() || 'Sem categoria',
        image: postImage.value.trim() || '',
        status: postStatus.value,
        publishedDate: postDate.value ? new Date(postDate.value).toISOString() : null,
        updatedAt: new Date().toISOString()
    };

    try {
        if (editingPostId) {
            await postsCollection.doc(editingPostId).update(postData);
            showToast('Postagem atualizada com sucesso!', 'success');
        } else {
            postData.createdAt = new Date().toISOString();
            await postsCollection.add(postData);
            showToast('Postagem criada com sucesso!', 'success');
        }
        closeModalFunc();
        loadPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        showToast('Erro ao salvar postagem', 'error');
    }
});

// Delete Post
async function deletePost(id) {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
    try {
        await postsCollection.doc(id).delete();
        showToast('Postagem excluída com sucesso!', 'success');
        loadPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Erro ao excluir postagem', 'error');
    }
}

// Close Modal
function closeModalFunc() {
    postModal.classList.remove('active');
    editingPostId = null;
}

cancelModal.addEventListener('click', closeModalFunc);
closeModal.addEventListener('click', closeModalFunc);
postModal.addEventListener('click', (e) => {
    if (e.target === postModal) closeModalFunc();
});

// Save Settings
saveSettingsBtn.addEventListener('click', async () => {
    try {
        await settingsCollection.set({
            title: siteTitle.value,
            description: siteDescription.value,
            logo: siteLogo.value,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Erro ao salvar configurações', 'error');
    }
});

// Load Settings
async function loadSettings() {
    try {
        const doc = await settingsCollection.get();
        if (doc.exists) {
            const data = doc.data();
            siteTitle.value = data.title || 'WikiWorldWeb';
            siteDescription.value = data.description || 'Explore o conhecimento do mundo';
            siteLogo.value = data.logo || '/assets/logo.png';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load Media
async function loadMedia() {
    try {
        const snapshot = await mediaCollection.orderBy('uploadedAt', 'desc').get();
        const mediaGrid = document.getElementById('mediaGrid');
        if (snapshot.empty) {
            mediaGrid.innerHTML = '<p style="color: var(--text-light);">Nenhuma mídia enviada</p>';
            return;
        }
        mediaGrid.innerHTML = snapshot.docs.map(doc => `
            <div class="media-item">
                <img src="${doc.data().url}" alt="${doc.data().name}" />
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading media:', error);
    }
}

// Media Upload
document.getElementById('mediaUpload').addEventListener('change', async (e) => {
    const files = e.target.files;
    for (const file of files) {
        try {
            // In a real app, you'd upload to Firebase Storage
            // This is a simplified version
            const reader = new FileReader();
            reader.onload = async (event) => {
                await mediaCollection.add({
                    name: file.name,
                    url: event.target.result,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
    showToast('Imagens enviadas com sucesso!', 'success');
    loadMedia();
});

// Load Analytics
async function loadAnalytics() {
    try {
        const snapshot = await postsCollection.get();
        const total = snapshot.size;
        totalPosts.textContent = total;
        
        // Simulated stats
        document.getElementById('totalViews').textContent = Math.floor(Math.random() * 10000);
        document.getElementById('totalComments').textContent = Math.floor(Math.random() * 500);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateStats() {
    // Update total posts in analytics
    if (document.getElementById('totalPosts')) {
        document.getElementById('totalPosts').textContent = posts.length;
    }
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 10);
}

// Add Toast Styles
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast.success {
        background: #16a34a;
    }
    
    .toast.error {
        background: #dc2626;
    }
    
    .toast i {
        font-size: 20px;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-light);
    }
    
    .empty-state i {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--border);
    }
    
    .empty-state p {
        font-size: 18px;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);

// Initialize
loadPosts();
loadSettings();
loadMedia();
loadAnalytics();
