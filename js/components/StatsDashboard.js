function createStatsDashboard() {
    const nextLevelXP = AppState.userLevel * 1000;
    const currentLevelBaseXP = (AppState.userLevel - 1) * 1000;
    const xpProgressInLevel = Math.max(0, AppState.totalXP - currentLevelBaseXP);
    const xpPercent = Math.min(100, Math.floor((xpProgressInLevel / 1000) * 100));

    return `
        <div class="dashboard-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; max-width: 1200px; margin: 0 auto; padding-bottom: 3rem;">
            <!-- Columna Izquierda: Estadísticas y Gráfica -->
            <div class="dashboard-left" style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                <!-- Tarjeta Principal de Nivel & XP -->
                <div class="profile-card-premium animate-fade-in" style="background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 1.25rem; padding: 2rem; color: white; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15); position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="position: absolute; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; right: -50px; top: -50px; pointer-events: none;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; position: relative;">
                        <div>
                            <span style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 99px;">Estudiante</span>
                            <h2 style="font-size: 2rem; font-weight: 800; margin: 0.5rem 0 0 0; letter-spacing: -0.5px;">${AppState.nombre}</h2>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.8);">${AppState.correo}</p>
                        </div>
                        <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.12); border-radius: 1.25rem; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.25); box-shadow: inset 0 4px 6px rgba(0,0,0,0.05);">
                            <span style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: rgba(255,255,255,0.7); margin-bottom: -2px;">Nivel</span>
                            <span style="font-size: 1.75rem; font-weight: 800; line-height: 1;">${AppState.userLevel}</span>
                        </div>
                    </div>
                    
                    <!-- Barra de Nivel -->
                    <div style="position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: rgba(255,255,255,0.95);">
                            <span>Progreso de Nivel</span>
                            <span>${AppState.totalXP % 1000} / 1000 XP</span>
                        </div>
                        <div style="height: 8px; background: rgba(255,255,255,0.2); border-radius: 99px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="width: ${xpPercent}%; height: 100%; background: #ffffff; border-radius: 99px; box-shadow: 0 0 12px rgba(255,255,255,0.6);"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Grid de Métricas de Estudio -->
                <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <!-- XP Acumulado -->
                    <div class="metric-card animate-fade-in" style="background: var(--stats-card-bg); border-radius: 1rem; padding: 1.25rem; border: 1px solid var(--stats-card-border); display: flex; align-items: center; gap: 1rem; box-shadow: var(--stats-card-shadow); transition: transform 0.2s, background 0.3s, border-color 0.3s;">
                        <div style="width: 48px; height: 48px; border-radius: 0.75rem; background: rgba(245, 158, 11, 0.08); color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.25rem;">
                            ${Icons.trophy}
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">XP Total</div>
                            <div style="font-size: 1.35rem; font-weight: 800; color: var(--stats-text-val); margin-top: 1px; line-height: 1; transition: color 0.3s;">${AppState.totalXP}</div>
                        </div>
                    </div>
                    
                    <!-- Racha de Estudio -->
                    <div class="metric-card animate-fade-in" style="background: var(--stats-card-bg); border-radius: 1rem; padding: 1.25rem; border: 1px solid var(--stats-card-border); display: flex; align-items: center; gap: 1rem; box-shadow: var(--stats-card-shadow); transition: transform 0.2s, background 0.3s, border-color 0.3s;">
                        <div style="width: 48px; height: 48px; border-radius: 0.75rem; background: rgba(16, 185, 129, 0.08); color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.25rem;">
                            ${Icons.award}
                        </div>
                        <div>
                            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Racha</div>
                            <div style="font-size: 1.35rem; font-weight: 800; color: var(--stats-text-val); margin-top: 1px; line-height: 1; transition: color 0.3s;">1 Día</div>
                        </div>
                    </div>
                    
                    <!-- Tema Actual -->
                    <div class="metric-card animate-fade-in" style="background: var(--stats-card-bg); border-radius: 1rem; padding: 1.25rem; border: 1px solid var(--stats-card-border); display: flex; align-items: center; gap: 1rem; box-shadow: var(--stats-card-shadow); transition: transform 0.2s, background 0.3s, border-color 0.3s;">
                        <div style="width: 48px; height: 48px; border-radius: 0.75rem; background: rgba(59, 130, 246, 0.08); color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.25rem;">
                            ${Icons.sparkles}
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Tema Activo</div>
                            <div style="font-size: 1.05rem; font-weight: 800; color: var(--stats-text-val); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; transition: color 0.3s;" title="${AppState.tema_actual}">${AppState.tema_actual}</div>
                        </div>
                    </div>
                </div>

                <!-- Gráfica de Progreso de Aprendizaje -->
                <div class="chart-card animate-fade-in" style="background: var(--stats-card-bg); border-radius: 1rem; padding: 1.75rem; border: 1px solid var(--stats-card-border); box-shadow: var(--stats-card-shadow); transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.3px; transition: color 0.3s;">
                        <span style="color: #6366f1; display: flex; align-items: center;">${Icons.trendingUp}</span>
                        <span>Progreso de Aprendizaje por Temas</span>
                    </h3>
                    <div style="position: relative; height: 280px; width: 100%;">
                        <canvas id="topics-progress-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Edición de Perfil -->
            <div class="dashboard-right" style="display: flex; flex-direction: column;">
                <div class="profile-edit-card animate-fade-in" style="background: var(--stats-card-bg); border-radius: 1rem; padding: 2rem; border: 1px solid var(--stats-card-border); box-shadow: var(--stats-card-shadow); height: 100%; box-sizing: border-box; transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;">
                    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1.75rem 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.3px; transition: color 0.3s;">
                        <span style="color: #a855f7; display: flex; align-items: center;">${Icons.lightbulb}</span>
                        <span>Configuración de Perfil</span>
                    </h3>
                    
                    <div id="profile-alert-container"></div>
                    
                    <form id="profile-edit-form" onsubmit="handleProfileUpdateSubmit(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <!-- Código de Estudiante (Read-only) -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Código UPAO (No editable)</label>
                            <input 
                                type="text" 
                                value="${AppState.usuario_id}" 
                                disabled 
                                style="background: var(--stats-input-disabled-bg); color: #94a3b8; border: 1px solid var(--stats-card-border); border-radius: 0.6rem; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 700; cursor: not-allowed; outline: none; transition: background 0.3s, border-color 0.3s;"
                            />
                        </div>

                        <!-- Nombre Completo -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label for="edit-name" style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Nombre Completo</label>
                            <input 
                                type="text" 
                                id="edit-name" 
                                value="${AppState.nombre}" 
                                required
                                style="background: var(--stats-input-bg); color: var(--stats-input-color); border: 1px solid var(--stats-input-border); border-radius: 0.6rem; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 600; outline: none; transition: all 0.3s;"
                                onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.15)';"
                                onblur="this.style.borderColor='var(--stats-input-border)'; this.style.boxShadow='none';"
                            />
                        </div>

                        <!-- Correo Electrónico -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label for="edit-email" style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Correo Institucional</label>
                            <input 
                                type="email" 
                                id="edit-email" 
                                value="${AppState.correo}" 
                                required
                                style="background: var(--stats-input-bg); color: var(--stats-input-color); border: 1px solid var(--stats-input-border); border-radius: 0.6rem; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 600; outline: none; transition: all 0.3s;"
                                onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.15)';"
                                onblur="this.style.borderColor='var(--stats-input-border)'; this.style.boxShadow='none';"
                            />
                        </div>

                        <!-- Nueva Contraseña -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label for="edit-password" style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                id="edit-password" 
                                placeholder="Dejar vacío para conservar actual" 
                                minlength="6"
                                style="background: var(--stats-input-bg); color: var(--stats-input-color); border: 1px solid var(--stats-input-border); border-radius: 0.6rem; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 600; outline: none; transition: all 0.3s;"
                                onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.15)';"
                                onblur="this.style.borderColor='var(--stats-input-border)'; this.style.boxShadow='none';"
                            />
                        </div>

                        <!-- Botón Guardar -->
                        <button type="submit" id="btn-save-profile" style="margin-top: 1rem; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; border-radius: 0.6rem; padding: 0.85rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(99,102,241,0.25); transition: all 0.2s; outline: none;">
                            <span>Guardar Cambios</span>
                            ${Icons.zap}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

async function renderStatsDashboard() {
    const container = document.getElementById('stats-dashboard');
    if (!container) return;

    container.innerHTML = createStatsDashboard();

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(AppState.usuario_id)}/progress`);
        if (!response.ok) throw new Error("No se pudo cargar la información detallada.");

        const data = await response.json();

        const canvas = document.getElementById('topics-progress-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const labels = data.map(item => item.topic);
        const resolvedCounts = data.map(item => item.resolved);
        const totalCounts = data.map(item => item.total);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const totalColor1 = isDark ? '#1e293b' : '#f1f5f9';
        const totalColor2 = isDark ? '#334155' : '#e2e8f0';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        const resolvedGradient = ctx.createLinearGradient(0, 0, 0, 250);
        resolvedGradient.addColorStop(0, '#3b82f6');
        resolvedGradient.addColorStop(1, '#6366f1');

        const totalGradient = ctx.createLinearGradient(0, 0, 0, 250);
        totalGradient.addColorStop(0, totalColor1);
        totalGradient.addColorStop(1, totalColor2);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Retos Completados',
                        data: resolvedCounts,
                        backgroundColor: resolvedGradient,
                        borderRadius: 5,
                        borderWidth: 0,
                        maxBarThickness: 15
                    },
                    {
                        label: 'Retos Totales del Tema',
                        data: totalCounts,
                        backgroundColor: totalGradient,
                        borderRadius: 5,
                        borderWidth: 0,
                        maxBarThickness: 15
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: 'Inter, sans-serif', size: 10, weight: '700' },
                            color: textColor,
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleFont: { family: 'Inter, sans-serif', size: 11, weight: 'bold' },
                        bodyFont: { family: 'Inter, sans-serif', size: 11 },
                        padding: 10,
                        cornerRadius: 6
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Inter, sans-serif', size: 9, weight: '600' },
                            color: textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { family: 'Inter, sans-serif', size: 9 },
                            color: textColor
                        },
                        grid: { color: gridColor }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando gráfica de progreso:", error);
    }
}

async function handleProfileUpdateSubmit(event) {
    event.preventDefault();
    const alertContainer = document.getElementById('profile-alert-container');
    const saveBtn = document.getElementById('btn-save-profile');

    if (!alertContainer || !saveBtn) return;

    alertContainer.innerHTML = '';
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.7';

    const nombre = document.getElementById('edit-name').value.trim();
    const correo = document.getElementById('edit-email').value.trim();
    const contrasena = document.getElementById('edit-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(AppState.usuario_id)}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                correo: correo,
                contrasena: contrasena && contrasena.trim() !== "" ? contrasena : null
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Error al actualizar el perfil.');
        }

        updateState({
            nombre: data.usuario.nombre,
            correo: data.usuario.correo
        });

        const userSession = localStorage.getItem('currentUser');
        if (userSession) {
            const user = JSON.parse(userSession);
            user.nombre = data.usuario.nombre;
            user.correo = data.usuario.correo;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        alertContainer.innerHTML = `
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 0.5rem; padding: 0.75rem 1rem; color: #065f46; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                ${Icons.check}
                <span>¡Perfil actualizado con éxito!</span>
            </div>
        `;

        document.getElementById('edit-password').value = '';

        renderHeader();

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alertContainer.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 0.5rem; padding: 0.75rem 1rem; color: #991b1b; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                ${Icons.alertCircle}
                <span>${error.message}</span>
            </div>
        `;
    } finally {
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
    }
}
