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
