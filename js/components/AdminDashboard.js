let adminStudentsList = [];
let selectedStudent = null;

function createAdminDashboard() {
    return `
        <div class="admin-dashboard-container">
            <header class="admin-header">
                <div class="header-left">
                    <div class="header-logo">
                        <div class="logo-icon">
                            ${Icons.code}
                        </div>
                    </div>
                    <div class="header-title">
                        <h1>EdTech IA: Administración</h1>
                        <p>Plataforma de Control del Tutor Inteligente</p>
                    </div>
                </div>

                <div class="header-right">
                    <button class="admin-btn-logout" onclick="handleAdminLogout()">
                        Cerrar Sesión
                        ${Icons.zap}
                    </button>
                </div>
            </header>

            <main class="admin-main-content">
                <div class="admin-welcome-section">
                    <div class="admin-welcome-title">
                        <h2>Gestión de Estudiantes</h2>
                        <p>Monitorea y configura en tiempo real el progreso de los alumnos en la base de datos.</p>
                    </div>
                </div>

                <div class="admin-grid-layout">
                    <!-- Lista de estudiantes -->
                    <div class="admin-panel-card">
                        <div class="admin-panel-card-header">
                            <h3>Estudiantes Registrados</h3>
                            <span class="admin-badge admin-badge-indigo" id="students-count-badge">0 Alumnos</span>
                        </div>
                        <div class="admin-table-container">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Nivel</th>
                                        <th>Experiencia</th>
                                        <th>Progreso</th>
                                        <th>Tema Actual</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-students-tbody">
                                    <!-- Renderizado Dinámico -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Formulario de Configuración -->
                    <div class="admin-panel-card">
                        <div class="admin-panel-card-header">
                            <h3>Configuración del Alumno</h3>
                        </div>
                        <div class="admin-form-container" id="admin-form-container">
                            ${createAdminEmptyState()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

function createAdminEmptyState() {
    return `
        <div class="admin-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
            </svg>
            <p>Selecciona un estudiante de la lista para ver o modificar su configuración académica y progreso.</p>
        </div>
    `;
}

function createAdminEditForm(student) {
    const topicsOptions = [
        'Variables',
        'Tipos de Datos',
        'Operadores',
        'Condicionales',
        'Bucles For',
        'Bucles While',
        'Funciones',
        'Arrays',
        'Objetos'
    ];

    return `
        <div id="admin-edit-alert"></div>
        
        <div class="login-form-group">
            <label class="admin-label">Código del Estudiante (ID)</label>
            <input type="text" class="admin-input" value="${student.usuario_id}" disabled />
        </div>

        <div class="login-form-group">
            <label class="admin-label">Nombre Completo</label>
            <input type="text" id="edit-nombre" class="admin-input" value="${student.nombre}" required />
        </div>

        <div class="admin-form-group-flex">
            <div class="login-form-group">
                <label class="admin-label">Nivel</label>
                <input type="number" id="edit-nivel" class="admin-input" min="1" max="20" value="${student.nivel}" required />
            </div>
            
            <div class="login-form-group">
                <label class="admin-label">Experiencia (XP)</label>
                <input type="number" id="edit-xp" class="admin-input" min="0" max="99999" value="${student.xp}" required />
            </div>
        </div>

        <div class="admin-form-group-flex">
            <div class="login-form-group">
                <label class="admin-label">Porcentaje (%)</label>
                <input type="number" id="edit-porcentaje" class="admin-input" min="0" max="100" value="${student.porcentaje}" required />
            </div>

            <div class="login-form-group">
                <label class="admin-label">Tema Actual</label>
                <select id="edit-tema" class="admin-select">
                    ${topicsOptions.map(t => `<option value="${t}" ${student.tema_actual === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>

        <button class="admin-btn-save" onclick="saveStudentChanges('${student.usuario_id}')">
            ${Icons.target}
            Guardar Configuración
        </button>
    `;
}

async function fetchAdminStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (!response.ok) throw new Error('Error al obtener lista de alumnos');

        adminStudentsList = await response.json();

        document.getElementById('students-count-badge').innerText = `${adminStudentsList.length} Alumnos`;

        renderStudentsTable();
    } catch (error) {
        console.error(error);
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('admin-students-tbody');
    tbody.innerHTML = adminStudentsList.map(student => {
        const isSelected = selectedStudent && selectedStudent.usuario_id === student.usuario_id;

        const initials = student.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        return `
            <tr class="${isSelected ? 'selected' : ''}" onclick="selectStudent('${student.usuario_id}')">
                <td>
                    <div class="admin-user-cell">
                        <div class="admin-avatar">${initials}</div>
                        <div class="admin-user-details">
                            <span class="admin-user-name">${student.nombre}</span>
                            <span class="admin-user-code">${student.usuario_id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="admin-badge admin-badge-indigo">Nivel ${student.nivel}</span>
                </td>
                <td>
                    <span class="admin-badge admin-badge-purple">${student.xp} XP</span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="admin-badge admin-badge-emerald">${student.porcentaje}%</span>
                    </div>
                </td>
                <td>
                    <span class="admin-badge admin-badge-amber">${student.tema_actual}</span>
                </td>
            </tr>
        `;
    }).join('');
}

function selectStudent(studentId) {
    selectedStudent = adminStudentsList.find(s => s.usuario_id === studentId);
    renderStudentsTable();

    const formContainer = document.getElementById('admin-form-container');
    formContainer.innerHTML = createAdminEditForm(selectedStudent);
}

async function saveStudentChanges(studentId) {
    const alertDiv = document.getElementById('admin-edit-alert');
    alertDiv.innerHTML = '';

    const nombre = document.getElementById('edit-nombre').value.trim();
    const nivel = parseInt(document.getElementById('edit-nivel').value);
    const xp = parseInt(document.getElementById('edit-xp').value);
    const porcentaje = parseInt(document.getElementById('edit-porcentaje').value);
    const tema = document.getElementById('edit-tema').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                nivel: nivel,
                xp: xp,
                porcentaje: porcentaje,
                tema_actual: tema
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Error al guardar cambios');

        const index = adminStudentsList.findIndex(s => s.usuario_id === studentId);
        if (index !== -1) {
            adminStudentsList[index] = { ...adminStudentsList[index], ...data };
        }

        selectedStudent = adminStudentsList[index];

        renderStudentsTable();
        alertDiv.innerHTML = `
            <div class="login-success-msg" style="margin-bottom: 1.25rem;">
                ${Icons.award}
                <span>¡Cambios guardados con éxito en la base de datos!</span>
            </div>
        `;

        document.getElementById('admin-form-container').innerHTML = createAdminEditForm(selectedStudent);

    } catch (error) {
        console.error(error);
        alertDiv.innerHTML = `
            <div class="login-error-msg" style="margin-bottom: 1.25rem;">
                ${Icons.zap}
                <span>${error.message}</span>
            </div>
        `;
    }
}

function handleAdminLogout() {
    localStorage.removeItem('currentUser');
    bootstrapApp();
}

function renderAdminDashboard() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = createAdminDashboard();
    fetchAdminStudents();
}
