const canonicalTopics = [
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

let allTopicsList = [...canonicalTopics];
let topicExerciseCounts = null;

function getDynamicTopics() {
    const progressIndex = allTopicsList.indexOf(AppState.tema_actual);

    return allTopicsList.map((title, idx) => {
        let state = 'locked';
        if (idx < progressIndex) {
            state = 'mastered';
        } else if (idx === progressIndex) {
            state = 'current';
        } else if (idx === progressIndex + 1) {
            state = 'available';
        }

        return {
            id: (idx + 1).toString(),
            title: title,
            state: state
        };
    });
}

function createCircularProgress(percentage) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <div class="circular-progress" style="width: 70px; height: 70px; position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="70" height="70" style="transform: rotate(-90deg);">
                <circle
                    cx="35"
                    cy="35"
                    r="${radius}"
                    stroke="#e2e8f0"
                    stroke-width="5"
                    fill="transparent"
                />
                <circle
                    cx="35"
                    cy="35"
                    r="${radius}"
                    stroke="url(#progress-gradient)"
                    stroke-width="5"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                    stroke-linecap="round"
                    fill="transparent"
                />
                <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#6366f1" />
                        <stop offset="100%" stop-color="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1;">
                <span style="font-size: 0.9rem; font-weight: 800; color: #1f2937;">${percentage}%</span>
                <span style="font-size: 0.45rem; color: #6b7280; margin-top: 1px; font-weight: 600; text-transform: uppercase;">Progreso</span>
            </div>
        </div>
    `;
}

function createLearningMap() {
    const activeTopics = getDynamicTopics();

    return `
        <div class="skill-tree-container" style="margin-top: 0;">
            ${(AppState.userLevel === 1 && AppState.totalXP === 0) ? `
                <div class="exam-banner animate-fade-in" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 1rem; padding: 1rem; margin-bottom: 1.5rem; text-align: center; box-shadow: var(--card-shadow); transition: background 0.3s, border-color 0.3s;">
                    <div style="font-weight: 700; color: #6366f1; margin-bottom: 0.25rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.85rem;">
                        ${Icons.award || ''}
                        <span>Examen de Diagnóstico</span>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.3;">¿Ya sabes programar? Toma un test teórico y desbloquea temas avanzados.</p>
                    <button onclick="openDiagnosticExam()" style="background: linear-gradient(to right, #6366f1, #9333ea); color: white; border: none; border-radius: 0.5rem; padding: 0.45rem 1rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: transform 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.25rem; outline: none;">
                        ${Icons.zap || ''}
                        <span>Iniciar Examen</span>
                    </button>
                </div>
            ` : ''}
            <h3 class="skill-tree-title" style="margin-top: 0; padding-top: 0;">Ruta de Aprendizaje</h3>
            <div class="skill-tree" style="${activeTopics.length === 0 ? 'display: block; text-align: center;' : ''}">
                ${activeTopics.length === 0 ? `
                    <div style="padding: 2.5rem 1rem; color: #64748b; font-size: 0.85rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 1rem; margin-top: 1rem;">
                        <div style="color: #6366f1; margin-bottom: 0.5rem;">
                            ${Icons.sparkles}
                        </div>
                        <p style="font-weight: 700; margin: 0 0 0.25rem 0; color: #1e293b;">No hay retos disponibles</p>
                        <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Actualmente no se han asignado retos de programación. Vuelve a consultar más tarde.</p>
                    </div>
                ` : activeTopics.map((topic, index) => `
                    <div class="skill-node-wrapper">
                        ${createSkillNode(topic)}
                        ${index < activeTopics.length - 1 ? `
                            <div class="skill-connector ${topic.state === 'mastered' ? 'connector-mastered' : 'connector-default'}"></div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLearningMap() {
    const mapElement = document.getElementById('learning-map');
    if (!mapElement) return;

    if (topicExerciseCounts === null) {
        mapElement.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #64748b; font-size: 0.875rem;">
                <span class="pulse-animation">Cargando ruta de aprendizaje...</span>
            </div>
        `;

        fetch(`${API_BASE_URL}/api/exercises-counts`)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener conteos');
                return res.json();
            })
            .then(data => {
                topicExerciseCounts = data;

                const activeTopicsFromDb = Object.keys(data).filter(topic => data[topic] > 0);

                if (activeTopicsFromDb.length > 0) {
                    allTopicsList = canonicalTopics.filter(topic => activeTopicsFromDb.includes(topic));
                    if (!allTopicsList.includes(AppState.currentTopic)) {
                        const oldTopic = AppState.currentTopic;
                        AppState.currentTopic = allTopicsList[0];
                        if (AppState.currentTopic !== oldTopic && typeof loadExercisesForTopic === 'function') {
                            loadExercisesForTopic(AppState.currentTopic);
                        }
                    }
                } else {
                    allTopicsList = [];
                    AppState.currentTopic = null;
                }

                renderLearningMap();
            })
            .catch(e => {
                console.error('Error al cargar conteos de temas:', e);
                topicExerciseCounts = {};
                allTopicsList = [];
                AppState.currentTopic = null;
                renderLearningMap();
            });
        return;
    }

    mapElement.innerHTML = createLearningMap();

    const activeTopics = getDynamicTopics();

    const nodes = mapElement.querySelectorAll('.node-icon');
    nodes.forEach((node, index) => {
        if (activeTopics[index]) {
            const topicState = activeTopics[index].state;
            if (topicState === 'mastered' || topicState === 'current') {
                node.addEventListener('click', () => handleNodeClick(activeTopics[index].id));
            }
        }
    });

    activeTopics.forEach(topic => {
        const count = topicExerciseCounts[topic.title] || 0;
        const badge = mapElement.querySelector(`[data-topic-id="${topic.id}"] .retos-count-badge`);
        if (badge) {
            badge.innerText = `${count} retos`;
        }
    });
}

let currentExamQuestions = [];
let userExamAnswers = [];
let currentExamIndex = 0;

async function openDiagnosticExam() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/exam/questions`);
        if (!response.ok) throw new Error('No se pudo obtener las preguntas del examen');
        currentExamQuestions = await response.json();

        userExamAnswers = [];
        currentExamIndex = 0;

        showExamQuestionModal();
    } catch (error) {
        console.error(error);
        alert('Error al iniciar el examen: ' + error.message);
    }
}

function showExamQuestionModal() {
    const existing = document.getElementById('exam-modal-overlay');
    if (existing) existing.remove();

    const q = currentExamQuestions[currentExamIndex];
    if (!q) return;

    const modalHTML = `
        <div id="exam-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 12, 30, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1.5rem; animation: fadeIn 0.3s ease-out;">
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 550px; border-radius: 1.5rem; padding: 2rem; box-shadow: var(--card-shadow); color: var(--text-primary); transition: background 0.3s, color 0.3s; display: flex; flex-direction: column; gap: 1.5rem; animation: scaleIn 0.3s ease-out;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #6366f1;">${Icons.award || ''}</span>
                        <span style="font-weight: 800; font-size: 1.1rem;">Examen de Diagnóstico (${currentExamIndex + 1}/${currentExamQuestions.length})</span>
                    </div>
                    <span style="font-size: 0.75rem; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 0.25rem 0.5rem; border-radius: 0.5rem; font-weight: 700;">
                        Tema: ${q.tema}
                    </span>
                </div>
                
                <!-- Question -->
                <div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.4; margin-bottom: 1.25rem;">${q.pregunta}</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="exam-options-container">
                        <button onclick="selectExamAnswer('A')" class="exam-option-btn" style="text-align: left; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; display: flex; gap: 0.75rem; outline: none;">
                            <span style="color: #6366f1; font-weight: 800;">A.</span>
                            <span>${q.opcion_a}</span>
                        </button>
                        <button onclick="selectExamAnswer('B')" class="exam-option-btn" style="text-align: left; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; display: flex; gap: 0.75rem; outline: none;">
                            <span style="color: #6366f1; font-weight: 800;">B.</span>
                            <span>${q.opcion_b}</span>
                        </button>
                        <button onclick="selectExamAnswer('C')" class="exam-option-btn" style="text-align: left; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; display: flex; gap: 0.75rem; outline: none;">
                            <span style="color: #6366f1; font-weight: 800;">C.</span>
                            <span>${q.opcion_c}</span>
                        </button>
                        <button onclick="selectExamAnswer('D')" class="exam-option-btn" style="text-align: left; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; display: flex; gap: 0.75rem; outline: none;">
                            <span style="color: #6366f1; font-weight: 800;">D.</span>
                            <span>${q.opcion_d}</span>
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 1rem; margin-top: 0.5rem;">
                    <button onclick="closeExamModal()" style="background: none; border: none; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; cursor: pointer;">
                        Cancelar Examen
                    </button>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        Presiona una opción para guardar y avanzar.
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const btns = document.querySelectorAll('.exam-option-btn');
    btns.forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.borderColor = '#6366f1';
            btn.style.background = 'rgba(99, 102, 241, 0.05)';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-primary)';
        });
    });
}

function selectExamAnswer(option) {
    const q = currentExamQuestions[currentExamIndex];
    userExamAnswers.push({
        pregunta_id: q.id,
        respuesta: option
    });

    currentExamIndex++;

    if (currentExamIndex < currentExamQuestions.length) {
        showExamQuestionModal();
    } else {
        submitExamResults();
    }
}

function closeExamModal() {
    const overlay = document.getElementById('exam-modal-overlay');
    if (overlay) overlay.remove();
}

async function submitExamResults() {
    const overlay = document.getElementById('exam-modal-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 450px; border-radius: 1.5rem; padding: 2.5rem; box-shadow: var(--card-shadow); color: var(--text-primary); text-align: center; display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
                <div class="pulse-animation" style="color: #6366f1; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(99, 102, 241, 0.1); border-radius: 50%;">
                    ${Icons.zap || ''}
                </div>
                <div>
                    <h3 style="font-weight: 800; font-size: 1.2rem; margin-bottom: 0.5rem;">Evaluando tus respuestas...</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">El orquestador está calificando tus respuestas para asignarte a tu nivel correspondiente del sílabo.</p>
                </div>
            </div>
        `;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/exam/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: AppState.usuario_id,
                respuestas: userExamAnswers
            })
        });

        if (!response.ok) throw new Error('Error al enviar los resultados');
        const data = await response.json();

        showExamFeedbackModal(data);

    } catch (error) {
        console.error(error);
        alert('Error al calificar el examen: ' + error.message);
        closeExamModal();
    }
}

function showExamFeedbackModal(data) {
    const overlay = document.getElementById('exam-modal-overlay');
    if (!overlay) return;

    let contentHTML = '';

    if (data.status === 'success' && data.temas_superados.length > 0) {
        const temasList = data.temas_superados.map(t => `<span style="background: rgba(16, 185, 129, 0.08); color: #059669; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.65rem; border-radius: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.2);">${t}</span>`).join('');

        contentHTML = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 500px; border-radius: 1.5rem; padding: 2.5rem; box-shadow: var(--card-shadow); color: var(--text-primary); text-align: center; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; animation: scaleIn 0.3s ease-out;">
                <div style="color: #10b981; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: rgba(16, 185, 129, 0.1); border-radius: 50%; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15);">
                    ${Icons.award || ''}
                </div>
                <div>
                    <h3 style="font-weight: 800; font-size: 1.4rem; margin-bottom: 0.5rem; color: #10b981;">¡Examen de Ubicación Completado!</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Has demostrado competencia en los siguientes temas:</p>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin: 0.5rem 0;">
                    ${temasList}
                </div>

                <div style="background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: 1rem; padding: 1rem; width: 100%; text-align: left; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem;">
                    <div><strong>Tema Asignado:</strong> <span style="color: #6366f1; font-weight: 700;">${data.nuevo_tema}</span></div>
                    <div><strong>Experiencia Obtenida:</strong> <span style="color: #fbbf24; font-weight: 700;">+${data.xp_ganada} XP</span></div>
                    <div><strong>Nivel Académico:</strong> <span style="color: #a855f7; font-weight: 700;">Nivel ${data.nivel}</span></div>
                </div>

                <button onclick="finishExamAndReload()" style="background: linear-gradient(to right, #10b981, #14b8a6); color: white; border: none; border-radius: 0.75rem; padding: 0.85rem 1.5rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; width: 100%; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); outline: none;">
                    Ingresar a la Plataforma
                </button>
            </div>
        `;
    } else {
        contentHTML = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 450px; border-radius: 1.5rem; padding: 2.5rem; box-shadow: var(--card-shadow); color: var(--text-primary); text-align: center; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; animation: scaleIn 0.3s ease-out;">
                <div style="color: #ef4444; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); border-radius: 50%;">
                    ${Icons.alertTriangle || ''}
                </div>
                <div>
                    <h3 style="font-weight: 800; font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">Evaluación de Diagnóstico</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Te recomendamos comenzar la ruta desde el primer nivel para consolidar firmemente tus bases en programación.</p>
                </div>

                <div style="background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: 1rem; padding: 1rem; width: 100%; text-align: left; font-size: 0.85rem;">
                    <strong>Tema Asignado:</strong> <span style="color: #6366f1; font-weight: 700;">Variables</span>
                </div>

                <button onclick="closeExamModal()" style="background: linear-gradient(to right, #6366f1, #9333ea); color: white; border: none; border-radius: 0.75rem; padding: 0.85rem 1.5rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; width: 100%; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); outline: none;">
                    Iniciar Aprendizaje
                </button>
            </div>
        `;
    }

    overlay.innerHTML = contentHTML;
}

function finishExamAndReload() {
    closeExamModal();

    fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(AppState.usuario_id)}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al refrescar usuario');
            return res.json();
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

            bootstrapApp();
        })
        .catch(err => {
            console.error("Error al refrescar tras examen:", err);
            bootstrapApp();
        });
}
