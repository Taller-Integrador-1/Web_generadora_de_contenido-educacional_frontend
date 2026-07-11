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

                ${loginActiveTab === 'login' ? `
                    <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0; width: 100%;">
                        <div style="flex-grow: 1; height: 1px; background: var(--border-light); opacity: 0.5;"></div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">o continúa con</span>
                        <div style="flex-grow: 1; height: 1px; background: var(--border-light); opacity: 0.5;"></div>
                    </div>
                    
                    <button type="button" class="google-login-btn" onclick="handleGoogleLogin()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>Iniciar sesión con Google</span>
                    </button>
                ` : ''}
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
                    pattern="^(?!0{9}$)[0-9]{9}$"
                    minlength="9"
                    maxlength="9"
                    inputmode="numeric"
                    title="El código de estudiante debe constar de exactamente 9 dígitos numéricos y uno debe ser diferente de cero."
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
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':,./?~|]).{8,}"
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

            if (/^\d+$/.test(username)) {
                if (username.length !== 9) {
                    throw new Error('El código de estudiante debe constar de exactamente 9 dígitos.');
                }
                if (/^(\d)\1{8}$/.test(username)) {
                    throw new Error('El código de estudiante no puede estar formado por el mismo dígito repetido.');
                }
            }

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
            if (/^(\d)\1{8}$/.test(code)) {
                throw new Error('El código de estudiante no puede estar formado por el mismo dígito repetido.');
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

let firebaseAuthInstance;

function getFirebaseAuth() {
    if (firebaseAuthInstance) return firebaseAuthInstance;
    
    const firebaseConfig = {
        authDomain: "ed-tech-329d6.firebaseapp.com",
        projectId: "ed-tech-329d6"
    };

    if (typeof firebase !== 'undefined') {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        firebaseAuthInstance = firebase.auth();
        return firebaseAuthInstance;
    }
    throw new Error('Firebase SDK no está cargado correctamente en la página.');
}

async function handleGoogleLogin() {
    const alertContainer = document.getElementById('login-alert-container');
    if (alertContainer) alertContainer.innerHTML = '';
    
    try {
        const authInstance = getFirebaseAuth();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await authInstance.signInWithPopup(provider);
        const user = result.user;
        
        if (!user || !user.email) {
            throw new Error('No se pudo obtener información del usuario de Google.');
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                uid: user.uid
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            throw new Error('El backend no responde correctamente al autenticar con Google.');
        }

        if (!response.ok) {
            throw new Error(data.detail || 'Error al sincronizar tu perfil de Google.');
        }

        localStorage.setItem('currentUser', JSON.stringify(data));

        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="login-success-msg">
                    ${Icons.award}
                    <span>¡Ingreso con Google exitoso! Redireccionando...</span>
                </div>
            `;
        }

        setTimeout(() => {
            bootstrapApp();
        }, 1000);
        
    } catch (error) {
        console.error("Google Auth error:", error);
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="login-error-msg">
                    ${Icons.zap}
                    <span>${error.message || 'Error al iniciar sesión con Google.'}</span>
                </div>
            `;
        }
    }
}
