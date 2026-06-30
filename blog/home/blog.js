/* style.css */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary: #64748b;
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #f59e0b;
    --bg: #f1f5f9;
    --card-bg: #ffffff;
    --text: #0f172a;
    --text-light: #64748b;
    --border: #e2e8f0;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --radius: 12px;
    --sidebar-width: 260px;
    --header-height: 70px;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--bg);
    color: var(--text);
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* Sidebar */
.sidebar {
    width: var(--sidebar-width);
    background: var(--card-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transition: transform 0.3s ease;
}

.sidebar .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px 30px;
    font-size: 22px;
    font-weight: 700;
    color: var(--primary);
}

.sidebar .logo i {
    font-size: 28px;
}

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 12px;
    flex: 1;
}

.nav-menu a {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: 8px;
    color: var(--text-light);
    text-decoration: none;
    transition: all 0.2s;
    font-weight: 500;
}

.nav-menu a:hover {
    background: var(--bg);
    color: var(--text);
}

.nav-menu a.active {
    background: var(--primary);
    color: white;
}

.nav-menu a i {
    width: 20px;
    text-align: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid var(--border);
    margin-top: auto;
}

.user-info .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.user-info .user-details {
    display: flex;
    flex-direction: column;
}

.user-info .name {
    font-weight: 600;
    font-size: 14px;
}

.user-info .email {
    font-size: 12px;
    color: var(--text-light);
}

/* Main Content */
.main-content {
    margin-left: var(--sidebar-width);
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* Header */
.top-header {
    height: var(--header-height);
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 100;
}

.top-header h1 {
    font-size: 20px;
    font-weight: 600;
}

.toggle-btn {
    display: none;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text);
}

.header-actions {
    display: flex;
    gap: 12px;
}

.btn-primary {
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
}

.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.btn-secondary:hover {
    background: var(--border);
}

/* Content Area */
.content-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
}

.section {
    display: none;
    animation: fadeIn 0.3s ease;
}

.section.active {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Filters */
.filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0 12px;
}

.search-box i {
    color: var(--text-light);
    margin-right: 10px;
}

.search-box input {
    border: none;
    outline: none;
    padding: 10px 0;
    width: 100%;
    background: transparent;
    font-size: 14px;
}

.filter-options {
    display: flex;
    gap: 12px;
}

.filter-options select {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    font-size: 14px;
    cursor: pointer;
    outline: none;
}

/* Posts Grid */
.posts-grid {
    display: grid;
    gap: 16px;
}

.post-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 20px 24px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.post-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.post-info {
    flex: 1;
}

.post-info h3 {
    font-size: 18px;
    margin-bottom: 6px;
    cursor: pointer;
    color: var(--text);
}

.post-info h3:hover {
    color: var(--primary);
}

.post-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-light);
}

.post-meta .status {
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status.published {
    background: #dcfce7;
    color: #16a34a;
}

.status.draft {
    background: #fef3c7;
    color: #d97706;
}

.status.scheduled {
    background: #dbeafe;
    color: #2563eb;
}

.post-actions {
    display: flex;
    gap: 8px;
}

.post-actions button {
    background: none;
    border: none;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 16px;
    color: var(--text-light);
}

.post-actions button:hover {
    background: var(--bg);
}

.post-actions .edit-btn:hover {
    color: var(--primary);
}

.post-actions .delete-btn:hover {
    color: var(--danger);
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: var(--card-bg);
    border-radius: var(--radius);
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    animation: modalIn 0.3s ease;
}

@keyframes modalIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
}

.modal-header h2 {
    font-size: 20px;
}

.modal-header .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: var(--text-light);
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s;
    outline: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
    resize: vertical;
}

/* Settings */
.settings-container,
.media-container,
.analytics-container {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 32px;
    box-shadow: var(--shadow);
}

.settings-container h2,
.media-container h2,
.analytics-container h2 {
    margin-bottom: 24px;
}

.settings-form {
    max-width: 600px;
}

/* Media */
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.media-item {
    aspect-ratio: 1;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--bg);
}

.media-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.media-upload {
    margin-top: 20px;
}

.media-upload input[type="file"] {
    display: none;
}

.upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--bg);
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.upload-btn:hover {
    border-color: var(--primary);
    background: #eff6ff;
}

/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-card {
    background: var(--bg);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-card i {
    font-size: 32px;
    color: var(--primary);
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 14px;
    color: var(--text-light);
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
    }

    .sidebar.open {
        transform: translateX(0);
    }

    .main-content {
        margin-left: 0;
    }

    .toggle-btn {
        display: block;
    }

    .top-header {
        padding: 0 16px;
    }

    .content-area {
        padding: 16px;
    }

    .filters {
        flex-direction: column;
    }

    .filter-options {
        flex-wrap: wrap;
    }

    .post-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .post-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .modal-content {
        margin: 10px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
