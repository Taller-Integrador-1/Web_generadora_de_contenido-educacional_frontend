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
            <label for="reg-code">Código de Estudiante (9 dígitos)</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.target}
                </div>
                <input 
                    type="text" 
                    id="reg-code" 
                    class="login-input" 
                    placeholder="Ej. 202110293" 
                    pattern="[0-9]{9}"
                    minlength="9"
                    maxlength="9"
                    inputmode="numeric"
                    title="El código de estudiante debe constar de exactamente 9 dígitos numéricos."
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
                    pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+"
                    title="El nombre completo solo puede contener letras y espacios."
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
                    pattern="[a-zA-Z0-9._%+-]+@upao\\.edu\\.pe"
                    title="Por favor ingresa un correo institucional válido que termine en @upao.edu.pe"
                    required
                />
            </div>
        </div>

        <div class="login-form-group">
            <label for="reg-password">Contraseña Segura</label>
            <div class="login-input-wrapper">
                <div class="login-input-icon">
                    ${Icons.award}
                </div>
                <input 
                    type="password" 
                    id="reg-password" 
                    class="login-input" 
                    placeholder="Mayúscula, minúscula, número y símbolo" 
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+={}\\[\\]:;\\\"'<>,.?~\\\\/-]).{8,}"
                    title="La contraseña debe tener al menos 8 caracteres, e incluir una mayúscula, una minúscula, un número y un carácter especial."
                    required
                />
            </div>
        </div>
    `;
}

function switchLoginTab(tab) {
    if (loginActiveTab === tab) {
        const alertContainer = document.getElementById('login-alert-container');
        if (alertContainer) alertContainer.innerHTML = '';
        return;
    }
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

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                throw new Error('El servidor de base de datos o el backend no responde correctamente. Por favor, inténtalo de nuevo.');
            }

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

            if (!/^\d{9}$/.test(code)) {
                throw new Error('El código de estudiante debe constar de exactamente 9 dígitos numéricos.');
            }

            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
                throw new Error('El nombre completo solo puede contener letras y espacios.');
            }

            if (!/^[a-zA-Z0-9._%+-]+@upao\.edu\.pe$/i.test(email)) {
                throw new Error('Por favor ingresa un correo institucional válido que termine en @upao.edu.pe');
            }

            if (contrasena.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres.');
            }
            if (!/[a-z]/.test(contrasena)) {
                throw new Error('La contraseña debe incluir al menos una letra minúscula.');
            }
            if (!/[A-Z]/.test(contrasena)) {
                throw new Error('La contraseña debe incluir al menos una letra mayúscula.');
            }
            if (!/\d/.test(contrasena)) {
                throw new Error('La contraseña debe incluir al menos un número.');
            }
            if (!/[!@#$%^&*()_+={}\[\]:;"'<>,.?~\\/-]/.test(contrasena)) {
                throw new Error('La contraseña debe incluir al menos un carácter especial (ej. !, @, #, $, etc.).');
            }

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

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                throw new Error('El servidor de base de datos o el backend no responde correctamente. Por favor, inténtalo de nuevo.');
            }

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
