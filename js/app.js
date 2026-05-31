//const API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = 'https://halayoc-edtech-backend.hf.space';

const AppState = {
    usuario_id: null,
    nombre: '',
    correo: '',
    rol: '',
    currentTopic: 'Variables',
    tema_actual: 'Variables',
    userLevel: 1,
    totalXP: 0,
    porcentaje: 0,
    currentView: 'learn'
};

function updateState(newState) {
    Object.assign(AppState, newState);
    console.log('Estado actualizado:', AppState);
}

function bootstrapApp() {
    console.log('🚀 Inicializando G29: Programación Adaptativa');
    const userSession = localStorage.getItem('currentUser');

    if (!userSession) {
        if (typeof difyConversationId !== 'undefined') difyConversationId = null;
        if (typeof chatHistory !== 'undefined') chatHistory = [];
        renderLoginScreen();
        console.log('🔑 Mostrando inicio de sesión');
    } else {
        try {
            const user = JSON.parse(userSession);

            updateState({
                usuario_id: user.usuario_id,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol,
                currentTopic: user.tema_actual || 'Variables',
                tema_actual: user.tema_actual || 'Variables',
                userLevel: user.nivel || 1,
                totalXP: user.xp || 0,
                porcentaje: user.porcentaje || 0
            });

            if (AppState.rol === 'admin') {
                renderAdminDashboard();
                console.log('🛠️ Panel de Administración Iniciado');
            } else {
                rebuildStudentLayout();

                renderHeader();
                renderLearningMap();
                renderCodeEditor();
                renderTutorPanel();
                console.log('🎓 Workspace de Estudiante Iniciado');

                fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(user.usuario_id)}`)
                    .then(res => {
                        if (res.ok) return res.json();
                        throw new Error('Error al obtener datos frescos');
                    })
                    .then(freshUser => {
                        const localData = {
                            usuario_id: freshUser.usuario_id,
                            nombre: freshUser.nombre,
                            correo: freshUser.correo,
                            rol: freshUser.rol,
                            nivel: freshUser.nivel,
                            xp: freshUser.xp,
                            tema_actual: freshUser.tema_actual,
                            porcentaje: freshUser.porcentaje
                        };
                        localStorage.setItem('currentUser', JSON.stringify(localData));

                        if (typeof reloadStudentStats === 'function') {
                            reloadStudentStats(localData);
                        }
                    })
                    .catch(err => {
                        console.warn("No se pudieron cargar datos frescos de usuario, usando cache local:", err);
                    });
            }
        } catch (error) {
            console.error('Error al restaurar sesión:', error);
            localStorage.removeItem('currentUser');
            renderLoginScreen();
        }
    }
}

function rebuildStudentLayout() {
    const appContainer = document.getElementById('app');
    appContainer.className = "app-container";
    appContainer.innerHTML = `
        <!-- Header Component -->
        <header id="header"></header>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Learning Map Sidebar -->
            <aside id="learning-map" class="learning-map-sidebar"></aside>

            <!-- Code Editor Area -->
            <main id="code-editor" class="code-editor-area"></main>

            <!-- Socratic Tutor Panel -->
            <aside id="tutor-panel" class="tutor-panel"></aside>
        </div>
    `;
}

function reloadStudentStats(userData) {
    const oldTopic = AppState.currentTopic;
    updateState({
        userLevel: userData.nivel,
        totalXP: userData.xp,
        porcentaje: userData.porcentaje,
        currentTopic: userData.tema_actual,
        tema_actual: userData.tema_actual
    });

    const userSession = localStorage.getItem('currentUser');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            user.nivel = userData.nivel;
            user.xp = userData.xp;
            user.porcentaje = userData.porcentaje;
            user.tema_actual = userData.tema_actual;
            localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (e) {
            console.error('Error al actualizar localStorage:', e);
        }
    }

    if (typeof topicExerciseCounts !== 'undefined') {
        topicExerciseCounts = null;
    }

    renderHeader();
    renderLearningMap();

    if (AppState.currentTopic !== oldTopic && typeof loadExercisesForTopic === 'function') {
        loadExercisesForTopic(AppState.currentTopic);
    }
}

function triggerConfettiEffect() {
    console.log("🎉 ¡Reto Completado! Lanzando confeti...");
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    document.body.appendChild(container);

    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval);
            setTimeout(() => container.remove(), 1000);
            return;
        }

        for (let i = 0; i < 5; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = Math.random() * 8 + 6 + 'px';
            confetti.style.height = Math.random() * 12 + 6 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.borderRadius = '2px';

            container.appendChild(confetti);

            const speed = Math.random() * 2 + 1;
            const drift = (Math.random() - 0.5) * 200;

            confetti.style.transition = `top ${speed}s linear, left ${speed}s ease-out, transform ${speed}s ease-out, opacity ${speed}s ease-in`;

            confetti.offsetHeight;

            confetti.style.top = '105vh';
            confetti.style.left = `calc(${confetti.style.left} + ${drift}px)`;
            confetti.style.transform = `rotate(${Math.random() * 720 - 360}deg)`;
            confetti.style.opacity = '0';

            setTimeout(() => confetti.remove(), speed * 1000);
        }
    }, 100);
}

function switchView(view) {
    AppState.currentView = view;
    renderHeader();
    if (view === 'learn') {
        rebuildStudentLayout();
        renderHeader();
        renderLearningMap();
        renderCodeEditor();
        renderTutorPanel();
    } else if (view === 'profile') {
        rebuildProfileLayout();
        renderHeader();
        renderStatsDashboard();
    }
}

function rebuildProfileLayout() {
    const appContainer = document.getElementById('app');
    appContainer.className = "app-container";
    appContainer.innerHTML = `
        <!-- Header Component -->
        <header id="header"></header>

        <!-- Main Content (Full screen profile & stats) -->
        <div class="main-content" style="padding: 2rem; display: block; overflow-y: auto; background: #f8fafc;">
            <div id="stats-dashboard" class="stats-dashboard-container"></div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', bootstrapApp);

