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
            <div class="header-title">
                <h1>EdTech IA</h1>
                <p>Aprende. Practica. Domina.</p>
            </div>
        </div>

        <div class="header-right">
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

