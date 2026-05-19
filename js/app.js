const API_BASE_URL = 'https://halayoc-edtech-api.hf.space';

const AppState = {
    usuario_id: null,
    nombre: '',
    correo: '',
    rol: '',
    currentTopic: 'Variables',
    userLevel: 1,
    totalXP: 0,
    porcentaje: 0
};

function updateState(newState) {
    Object.assign(AppState, newState);
    console.log('Estado actualizado:', AppState);
}

function bootstrapApp() {
    console.log('🚀 Inicializando G29: Programación Adaptativa');
    const userSession = localStorage.getItem('currentUser');

    if (!userSession) {
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
                userLevel: user.nivel || 1,
                totalXP: user.xp || 0,
                porcentaje: user.porcentaje || 0
            });

            if (AppState.rol === 'admin') {
                renderAdminDashboard();
                console.log('🛠️ Iniciando Panel de Administración');
            } else {
                rebuildStudentLayout();

                renderHeader();
                renderLearningMap();
                renderCodeEditor();
                renderTutorPanel();
                console.log('🎓 Iniciando Workspace de Estudiante');
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

document.addEventListener('DOMContentLoaded', bootstrapApp);

