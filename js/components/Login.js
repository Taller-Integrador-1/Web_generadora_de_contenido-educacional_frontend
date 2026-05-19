let loginActiveTab = 'login';

function createLoginScreen() {
    return `
        <div class="login-page-container">
            <div class="login-bg-glow"></div>
            <div class="login-bg-glow-right"></div>
            
            <div class="login-card-wrapper">
                <div class="login-card-header">
                    <div class="login-logo">
                        <div class="logo-icon" style="width: 64px; height: 64px; border-radius: 1.25rem;">
                            ${Icons.code}
                        </div>
                    </div>
                    <div class="login-title">
                        <h2>EdTech IA</h2>
                        <p>Plataforma de Aprendizaje Adaptativo IA</p>
                    </div>
                </div>

                <div class="login-tabs">
                    <div class="login-tab ${loginActiveTab === 'login' ? 'active' : ''}" onclick="switchLoginTab('login')">
                        Iniciar Sesión
                    </div>
                    <div class="login-tab ${loginActiveTab === 'register' ? 'active' : ''}" onclick="switchLoginTab('register')">
                        Registrarse
                    </div>
                </div>

                <div id="login-alert-container"></div>

                <form id="auth-form" onsubmit="handleAuthSubmit(event)">
                    ${loginActiveTab === 'login' ? createLoginFormFields() : createRegisterFormFields()}
                    
                    <button type="submit" class="login-btn" id="submit-btn">
                        <span>${loginActiveTab === 'login' ? 'Acceder a la Plataforma' : 'Crear Cuenta'}</span>
                        ${Icons.zap}
                    </button>
                </form>
            </div>
        </div>
    `;
}

function createLoginFormFields() {
    return `
        <div class="login-form-group">
            <label for="login-username">Código UPAO o Correo</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.target}
                </div>
                <input 
                    type="text" 
                    id="login-username" 
                    class="login-input" 
                    placeholder="Ej. UPAO-123 o correo@upao.edu.pe" 
                    required
                />
            </div>
        </div>

        <div class="login-form-group">
            <label for="login-password">Contraseña</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.award}
                </div>
                <input 
                    type="password" 
                    id="login-password" 
                    class="login-input" 
                    placeholder="••••••••" 
                    required
                />
            </div>
        </div>
    `;
}

function createRegisterFormFields() {
    return `
        <div class="login-form-group">
            <label for="reg-code">Código de Estudiante</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.target}
                </div>
                <input 
                    type="text" 
                    id="reg-code" 
                    class="login-input" 
                    placeholder="Ej. UPAO-999" 
                    required
                />
            </div>
        </div>

        <div class="login-form-group">
            <label for="reg-name">Nombre Completo</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.lightbulb}
                </div>
                <input 
                    type="text" 
                    id="reg-name" 
                    class="login-input" 
                    placeholder="Ej. Pepito Pérez" 
                    required
                />
            </div>
        </div>

        <div class="login-form-group">
            <label for="reg-email">Correo Institucional</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.sparkles}
                </div>
                <input 
                    type="email" 
                    id="reg-email" 
                    class="login-input" 
                    placeholder="Ej. correo@upao.edu.pe" 
                    required
                />
            </div>
        </div>

        <div class="login-form-group">
            <label for="reg-password">Contraseña</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.award}
                </div>
                <input 
                    type="password" 
                    id="reg-password" 
                    class="login-input" 
                    placeholder="Min. 6 caracteres" 
                    minlength="6"
                    required
                />
            </div>
        </div>
    `;
}

function switchLoginTab(tab) {
    if (loginActiveTab === tab) return;
    loginActiveTab = tab;
    renderLoginScreen();
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    const alertContainer = document.getElementById('login-alert-container');
    const submitBtn = document.getElementById('submit-btn');
    alertContainer.innerHTML = '';

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
        if (loginActiveTab === 'login') {
            const username = document.getElementById('login-username').value.trim();
            const contrasena = document.getElementById('login-password').value;

            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: username, contrasena: contrasena })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Error de autenticación.');
            }

            localStorage.setItem('currentUser', JSON.stringify(data));

            alertContainer.innerHTML = `
                <div class="login-success-msg">
                    ${Icons.award}
                    <span>¡Ingreso exitoso! Redireccionando...</span>
                </div>
            `;

            setTimeout(() => {
                bootstrapApp();
            }, 1000);

        } else {
            const code = document.getElementById('reg-code').value.trim();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const contrasena = document.getElementById('reg-password').value;

            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: code,
                    nombre: name,
                    correo: email,
                    contrasena: contrasena
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Error al registrar.');
            }

            alertContainer.innerHTML = `
                <div class="login-success-msg">
                    ${Icons.award}
                    <span>¡Registro exitoso! Ya puedes iniciar sesión.</span>
                </div>
            `;

            setTimeout(() => {
                loginActiveTab = 'login';
                renderLoginScreen();
            }, 1500);
        }
    } catch (error) {
        console.error(error);
        alertContainer.innerHTML = `
            <div class="login-error-msg">
                ${Icons.zap}
                <span>${error.message}</span>
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

function renderLoginScreen() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = createLoginScreen();
}
