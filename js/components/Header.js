function createHeader() {
    const initials = AppState.nombre 
        ? AppState.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
        : 'WC';

    const xpFormatted = AppState.totalXP.toLocaleString();

    return `
        <div class="header-left">
            <div class="header-logo">
                <div class="logo-icon">
                    ${Icons.code}
                </div>
            </div>
            <div class="header-title" style="margin-right: 1.5rem;">
                <h1>EdTech IA</h1>
                <p>Aprende. Practica. Domina.</p>
            </div>
            ${AppState.rol === 'student' ? `
            <nav class="header-nav" style="display: flex; gap: 0.5rem; align-items: center; border-left: 1px solid rgba(226, 232, 240, 0.8); padding-left: 1.5rem; height: 36px; margin-top: 2px;">
                <button class="nav-tab ${AppState.currentView === 'learn' ? 'active' : ''}" onclick="switchView('learn')" style="background: ${AppState.currentView === 'learn' ? 'rgba(99, 102, 241, 0.1)' : 'none'}; border: none; color: ${AppState.currentView === 'learn' ? '#4f46e5' : '#64748b'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 6px; transition: all 0.2s; outline: none;">
                    ${Icons.code} Aprender
                </button>
                <button class="nav-tab ${AppState.currentView === 'profile' ? 'active' : ''}" onclick="switchView('profile')" style="background: ${AppState.currentView === 'profile' ? 'rgba(99, 102, 241, 0.1)' : 'none'}; border: none; color: ${AppState.currentView === 'profile' ? '#4f46e5' : '#64748b'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 6px; transition: all 0.2s; outline: none;">
                    ${Icons.trendingUp} Mi Progreso y Perfil
                </button>
            </nav>
            ` : ''}
        </div>

        <div class="header-right">
            <button class="theme-toggle-btn" onclick="toggleTheme()" title="Cambiar Tema" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; color: var(--text-secondary); transition: background 0.2s, color 0.2s; padding: 0;" onmouseover="this.style.background='var(--border-light)'" onmouseout="this.style.background='none'">
                ${(document.documentElement.getAttribute('data-theme') === 'dark') ? Icons.sun : Icons.moon}
            </button>

            <div class="xp-card">
                ${Icons.trophy}
                <div>
                    <div class="xp-label">Total XP</div>
                    <div class="xp-value" id="header-xp-value">${xpFormatted} XP</div>
                </div>
            </div>

            <div class="user-card">
                <div class="user-info">
                    <div class="user-name" id="header-user-name">${AppState.nombre}</div>
                    <div class="user-level" id="header-user-level">
                        ${Icons.star}
                        <span>Nivel ${AppState.userLevel}</span>
                    </div>
                </div>
                <div class="user-avatar">${initials}</div>
                <button class="header-logout-btn" onclick="handleLogout()" title="Cerrar Sesión">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderHeader() {
    const headerElement = document.getElementById('header');
    headerElement.innerHTML = createHeader();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    bootstrapApp();
}

