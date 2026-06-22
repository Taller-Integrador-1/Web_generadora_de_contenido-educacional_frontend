let adminStudentsList = [];
let selectedStudent = null;
let adminActiveTab = 'students';
let adminPendingExercises = [];
let adminTopicsList = [
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

async function fetchAdminTopics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (response.ok) {
            adminTopicsList = await response.json();
        }
    } catch (error) {
        console.error("Error al obtener temas de la base de datos:", error);
    }
}


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
                    <button class="theme-toggle-btn" onclick="toggleTheme()" title="Cambiar Tema" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; color: var(--text-secondary); transition: background 0.2s, color 0.2s; padding: 0; margin-right: 0.5rem;" onmouseover="this.style.background='var(--border-light)'" onmouseout="this.style.background='none'">
                        ${(document.documentElement.getAttribute('data-theme') === 'dark') ? Icons.sun : Icons.moon}
                    </button>
                    <button class="admin-btn-logout" onclick="handleAdminLogout()">
                        Cerrar Sesión
                        ${Icons.zap}
                    </button>
                </div>
            </header>

            <main class="admin-main-content" style="padding: 2rem; max-width: 1600px; margin: 0 auto; width: 100%;">
                <!-- Pestañas de Navegación -->
                <div class="admin-tabs" style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.25rem; transition: border-color 0.3s;">
                    <button class="admin-tab-btn" onclick="switchAdminTab('students')" style="background: none; border: none; font-size: 1.1rem; font-weight: 600; padding: 0.5rem 1.5rem; cursor: pointer; color: ${adminActiveTab === 'students' ? '#4f46e5' : 'var(--text-secondary)'}; border-bottom: ${adminActiveTab === 'students' ? '4px solid #4f46e5' : 'none'}; outline: none; transition: all 0.2s;">
                        Gestión de Estudiantes
                    </button>
                    <button class="admin-tab-btn" onclick="switchAdminTab('syllabus')" style="background: none; border: none; font-size: 1.1rem; font-weight: 600; padding: 0.5rem 1.5rem; cursor: pointer; color: ${adminActiveTab === 'syllabus' ? '#4f46e5' : 'var(--text-secondary)'}; border-bottom: ${adminActiveTab === 'syllabus' ? '4px solid #4f46e5' : 'none'}; outline: none; transition: all 0.2s;">
                        Cargar Sílabo y Ejercicios
                    </button>
                </div>

                <div id="admin-tab-content">
                    ${adminActiveTab === 'students' ? createStudentsView() : createAdminSyllabusView()}
                </div>
            </main>
        </div>
    `;
}

function switchAdminTab(tab) {
    if (adminActiveTab === tab) return;
    adminActiveTab = tab;
    selectedStudent = null;
    renderAdminDashboard();
}

function createStudentsView() {
    return `
        <div class="admin-welcome-section" style="margin-bottom: 2rem;">
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
    `;
}

function createAdminSyllabusView() {
    return `
        <div class="admin-welcome-section" style="margin-bottom: 2rem;">
            <div class="admin-welcome-title">
                <h2>Carga de Sílabos y Retos de Aprendizaje</h2>
                <p>Sube el sílabo oficial del curso para que el agente Dify lo use como conocimiento y genere retos de programación.</p>
            </div>
        </div>

        <div class="admin-grid-layout" style="display: grid; grid-template-columns: 1.2fr 1.3fr 2fr; gap: 2rem;">
            <!-- Formulario de Carga -->
            <div class="admin-panel-card" style="padding: 1.5rem; background: var(--stats-card-bg); border-radius: 1rem; border: 1px solid var(--stats-card-border); box-shadow: var(--stats-card-shadow); transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;">
                <div class="admin-panel-card-header" style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; transition: border-color 0.3s;">
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); transition: color 0.3s;">Subir Sílabo</h3>
                </div>

                <div id="syllabus-alert-container"></div>

                <form id="syllabus-upload-form" onsubmit="handleSyllabusSubmit(event)">
                    <div class="login-form-group" style="margin-bottom: 1.25rem;">
                        <label class="admin-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; transition: color 0.3s;">Seleccionar archivo (PDF o Word)</label>
                        <input type="file" id="syllabus-file" accept=".pdf,.docx" required style="width: 100%; padding: 0.75rem; border: 2px dashed var(--stats-input-border); border-radius: 0.5rem; background: var(--stats-input-disabled-bg); color: var(--stats-input-color); font-size: 0.875rem; transition: all 0.3s;" />
                    </div>

                    <div class="login-form-group" style="margin-bottom: 1.5rem;">
                        <label class="admin-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; transition: color 0.3s;">Cantidad de Ejercicios a Generar</label>
                        <input type="number" id="syllabus-qty" min="1" max="10" value="3" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--stats-input-border); border-radius: 0.5rem; font-size: 0.875rem; background: var(--stats-input-bg); color: var(--stats-input-color); transition: all 0.3s;" />
                    </div>

                    <button type="submit" class="admin-btn-save" id="syllabus-upload-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; font-size: 0.95rem; font-weight: 700; border-radius: 0.5rem; background: linear-gradient(to right, #4f46e5, #7c3aed); border: none; color: white; cursor: pointer; transition: all 0.2s;">
                        ${Icons.zap}
                        <span>Subir y Analizar Sílabo</span>
                    </button>
                </form>
            </div>

            <!-- Visor de Sílabo Activo y Materiales de Dify -->
            <div class="admin-panel-card" style="padding: 1.5rem; background: var(--stats-card-bg); border-radius: 1rem; border: 1px solid var(--stats-card-border); box-shadow: var(--stats-card-shadow); transition: background 0.3s, border-color 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <div class="admin-panel-card-header" style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; transition: border-color 0.3s;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); transition: color 0.3s; display: flex; align-items: center; gap: 0.5rem;">
                            ${Icons.fileCode || Icons.code}
                            <span>Sílabo Activo en Sistema</span>
                        </h3>
                    </div>
                    <div id="syllabus-viewer-container" style="display: flex; flex-direction: column; min-height: 0;">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; line-height: 1.3;" id="syllabus-viewer-meta">Cargando información del sílabo...</p>
                        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.8rem; overflow-y: auto; white-space: pre-wrap; color: var(--text-primary); height: 160px; max-height: 160px;" id="syllabus-viewer-text">
                            No se ha cargado ningún sílabo en el sistema.
                        </div>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-light); padding-top: 1rem; display: flex; flex-direction: column; min-height: 0;">
                    <div class="admin-panel-card-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); transition: color 0.3s; display: flex; align-items: center; gap: 0.5rem;">
                            ${Icons.brain || ''}
                            <span>Materiales en Conocimiento (Dify RAG)</span>
                        </h3>
                    </div>
                    <div id="dify-docs-container" style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto; padding-right: 0.25rem;">
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Cargando documentos de Dify...</p>
                    </div>
                </div>
            </div>

            <!-- Listado de Ejercicios Generados -->
            <div class="admin-panel-card" style="padding: 1.5rem; background: var(--stats-card-bg); border-radius: 1rem; border: 1px solid var(--stats-card-border); box-shadow: var(--stats-card-shadow); transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;">
                <div class="admin-panel-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; transition: border-color 0.3s;">
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); transition: color 0.3s;">Retos Propuestos Pendientes</h3>
                    <span class="admin-badge admin-badge-indigo" id="pending-exercises-badge">0 Pendientes</span>
                </div>

                <div id="admin-exercises-container" style="display: flex; flex-direction: column; gap: 1.25rem; max-height: 500px; overflow-y: auto; padding-right: 0.5rem;">
                    ${createExercisesEmptyState()}
                </div>
            </div>
        </div>
    `;
}

function createExercisesEmptyState() {
    return `
        <div class="admin-empty-state" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; color: var(--text-muted);">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p style="font-weight: 600; margin-bottom: 0.25rem;">No hay retos sugeridos pendientes</p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Sube un archivo para que el agente extraiga la información del sílabo.</p>
        </div>
    `;
}

function renderPendingExercisesList() {
    return adminPendingExercises.map(ex => `
        <div class="exercise-card" style="border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; background: var(--bg-tertiary); transition: background 0.3s, border-color 0.3s;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                <h4 style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem; margin: 0; transition: color 0.3s;">${ex.titulo}</h4>
                <div style="display: flex; gap: 0.5rem;">
                    <span class="admin-badge admin-badge-indigo" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${ex.tema}</span>
                    <span class="admin-badge admin-badge-amber" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${ex.dificultad}</span>
                </div>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.25rem 0; line-height: 1.4; transition: color 0.3s;">${ex.descripcion}</p>
            
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 0.75rem; transition: border-color 0.3s;">
                <button onclick="approveExercise(${ex.id})" style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s;">
                    Aprobar Reto
                </button>
                <button onclick="deleteExercise(${ex.id})" style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s;">
                    Descartar
                </button>
            </div>
        </div>
    `).join('');
}

async function fetchPendingExercises() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/exercises/pending`);
        if (!response.ok) throw new Error('Error al obtener ejercicios pendientes');
        adminPendingExercises = await response.json();

        const badge = document.getElementById('pending-exercises-badge');
        if (badge) badge.innerText = `${adminPendingExercises.length} Pendientes`;

        const container = document.getElementById('admin-exercises-container');
        if (container) {
            container.innerHTML = adminPendingExercises.length === 0 ? createExercisesEmptyState() : renderPendingExercisesList();
        }
    } catch (error) {
        console.error(error);
    }
}

async function handleSyllabusSubmit(event) {
    event.preventDefault();
    const alertContainer = document.getElementById('syllabus-alert-container');
    const uploadBtn = document.getElementById('syllabus-upload-btn');
    const fileInput = document.getElementById('syllabus-file');
    const qtyInput = document.getElementById('syllabus-qty');

    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cantidad', qtyInput ? qtyInput.value : '3');

    alertContainer.innerHTML = '';
    uploadBtn.disabled = true;
    uploadBtn.style.opacity = '0.7';
    uploadBtn.querySelector('span').innerText = 'Subiendo y analizando con Dify...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/upload-syllabus`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error en el servidor al procesar el sílabo');

        alertContainer.innerHTML = `
            <div class="login-success-msg" style="margin-bottom: 1.25rem;">
                ${Icons.award}
                <span>¡Sílabo subido y retos generados con éxito!</span>
            </div>
        `;

        fileInput.value = '';
        await fetchPendingExercises();
        await fetchActiveSyllabus();
        await fetchDifyDocuments();

    } catch (error) {
        console.error(error);
        alertContainer.innerHTML = `
            <div class="login-error-msg" style="margin-bottom: 1.25rem;">
                ${Icons.zap}
                <span>Error: ${error.message}</span>
            </div>
        `;
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.style.opacity = '1';
        uploadBtn.querySelector('span').innerText = 'Subir y Analizar Sílabo';
    }
}

async function approveExercise(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/exercises/${id}/approve`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('No se pudo aprobar el reto');
        if (typeof topicExerciseCounts !== 'undefined') {
            topicExerciseCounts = null;
        }
        await fetchPendingExercises();
    } catch (error) {
        console.error(error);
        alert('Error al aprobar: ' + error.message);
    }
}

async function deleteExercise(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/exercises/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('No se pudo descartar el reto');
        if (typeof topicExerciseCounts !== 'undefined') {
            topicExerciseCounts = null;
        }
        await fetchPendingExercises();
    } catch (error) {
        console.error(error);
        alert('Error al descartar: ' + error.message);
    }
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
    const topicsOptions = adminTopicsList;

    return `
        <div id="admin-edit-alert"></div>
        
        <div class="login-form-group">
            <label class="admin-label">Código del Estudiante (ID)</label>
            <input type="text" class="admin-input" value="${student.usuario_id}" disabled />
        </div>

        <div class="login-form-group">
            <label class="admin-label">Nombre Completo</label>
            <input type="text" id="edit-nombre" class="admin-input" value="${student.nombre}" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="El nombre completo solo puede contener letras y espacios." required />
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
        await fetchAdminTopics();
        const response = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (!response.ok) throw new Error('Error al obtener lista de alumnos');

        adminStudentsList = await response.json();

        const countBadge = document.getElementById('students-count-badge');
        if (countBadge) countBadge.innerText = `${adminStudentsList.length} Alumnos`;

        renderStudentsTable();
    } catch (error) {
        console.error(error);
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('admin-students-tbody');
    if (!tbody) return;
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
    if (formContainer) {
        formContainer.innerHTML = createAdminEditForm(selectedStudent);
    }
}

async function saveStudentChanges(studentId) {
    const alertDiv = document.getElementById('admin-edit-alert');
    if (!alertDiv) return;
    alertDiv.innerHTML = '';

    const nombre = document.getElementById('edit-nombre').value.trim();
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        alertDiv.innerHTML = `
            <div class="login-error-msg" style="margin-bottom: 1.25rem;">
                ${Icons.zap}
                <span>El nombre completo solo puede contener letras y espacios.</span>
            </div>
        `;
        return;
    }
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
    if (adminActiveTab === 'students') {
        fetchAdminStudents();
    } else {
        fetchPendingExercises();
        fetchActiveSyllabus();
        fetchDifyDocuments();
    }
}

async function fetchActiveSyllabus() {
    const metaContainer = document.getElementById('syllabus-viewer-meta');
    const textContainer = document.getElementById('syllabus-viewer-text');
    if (!metaContainer || !textContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/syllabus`);
        if (!response.ok) throw new Error('No se pudo obtener el sílabo');
        const data = await response.json();
        
        if (data.filename) {
            const fecha = new Date(data.fecha_subida).toLocaleString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            metaContainer.innerHTML = `<strong>Archivo:</strong> ${data.filename}<br><strong>Cargado:</strong> ${fecha}`;
            textContainer.innerText = data.contenido;
        } else {
            metaContainer.innerText = 'No hay sílabo cargado actualmente.';
            textContainer.innerText = 'Por favor, sube un sílabo en formato PDF o Word.';
        }
    } catch (error) {
        console.error(error);
        metaContainer.innerText = 'Error al consultar sílabo.';
        textContainer.innerText = 'No se pudo obtener la información de sílabos desde el servidor.';
    }
}

async function fetchDifyDocuments() {
    const container = document.getElementById('dify-docs-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dify-documents`);
        if (!response.ok) throw new Error('Error al obtener documentos de Dify');
        const data = await response.json();
        
        renderDifyDocuments(data.documents);
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div style="font-size: 0.85rem; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem; background: rgba(239, 68, 68, 0.05); border-radius: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.2);">
                ${Icons.zap}
                <span>Error al cargar documentos de Dify.</span>
            </div>
        `;
    }
}

function renderDifyDocuments(documents) {
    const container = document.getElementById('dify-docs-container');
    if (!container) return;

    if (!documents || documents.length === 0) {
        container.innerHTML = `
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">
                No hay documentos cargados en el conocimiento de Dify.
            </p>
        `;
        return;
    }

    container.innerHTML = documents.map(doc => {
        const info = doc.data_source_detail_dict?.upload_file || {};
        const sizeKB = info.size ? Math.round(info.size / 1024) : 0;
        const wordCount = doc.word_count || 0;
        const tokens = doc.tokens || 0;
        const hitCount = doc.hit_count || 0;
        const status = doc.indexing_status || 'desconocido';

        let statusColor = '#94a3b8';
        let statusLabel = 'Procesando';
        if (status === 'completed') {
            statusColor = '#10b981';
            statusLabel = 'Completado';
        } else if (status === 'error') {
            statusColor = '#ef4444';
            statusLabel = 'Error';
        }

        const createdDate = doc.created_at ? new Date(doc.created_at * 1000).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : 'Reciente';

        return `
            <div style="border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; background: var(--bg-tertiary); display: flex; flex-direction: column; gap: 0.5rem; transition: background 0.3s, border-color 0.3s;">
                <div style="display: flex; align-items: start; gap: 0.5rem; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
                        <div style="color: #6366f1; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${doc.name}">${doc.name}</span>
                    </div>
                    <span style="font-size: 0.7rem; background: ${statusColor}15; color: ${statusColor}; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-weight: 800; text-transform: uppercase;">
                        ${statusLabel}
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; font-size: 0.75rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 0.4rem; margin-top: 0.2rem;">
                    <div><strong>Palabras:</strong> ${wordCount}</div>
                    <div><strong>Tokens:</strong> ${tokens}</div>
                    <div><strong>Tamaño:</strong> ${sizeKB} KB</div>
                    <div><strong>Búsquedas (Hits):</strong> ${hitCount}</div>
                    <div style="grid-column: span 2;"><strong>Cargado:</strong> ${createdDate}</div>
                </div>
            </div>
        `;
    }).join('');
}
