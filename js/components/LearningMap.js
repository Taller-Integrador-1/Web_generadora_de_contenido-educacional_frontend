const allTopicsList = [
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

function getDynamicTopics() {
    const currentIndex = allTopicsList.indexOf(AppState.currentTopic);

    return allTopicsList.map((title, idx) => {
        let state = 'locked';
        if (idx < currentIndex) {
            state = 'mastered';
        } else if (idx === currentIndex) {
            state = 'current';
        } else if (idx === currentIndex + 1) {
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
    const radius = 47.5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <div class="circular-progress">
            <svg width="100" height="100" class="progress-ring">
                <circle
                    class="progress-ring-circle"
                    cx="50"
                    cy="50"
                    r="${radius}"
                />
                <circle
                    class="progress-ring-circle-fill"
                    cx="50"
                    cy="50"
                    r="${radius}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                />
            </svg>
            <div class="progress-text">
                <div class="progress-percentage">${percentage}%</div>
                <div class="progress-label">Completado</div>
            </div>
        </div>
    `;
}

function createLearningMap() {
    const activeTopics = getDynamicTopics();
    const masteredCount = activeTopics.filter(t => t.state === 'mastered').length;
    const totalCount = activeTopics.length;

    const nextLevelXP = AppState.userLevel * 1000;
    const currentLevelBaseXP = (AppState.userLevel - 1) * 1000;
    const xpProgressInLevel = Math.max(0, AppState.totalXP - currentLevelBaseXP);
    const xpPercent = Math.min(100, Math.floor((xpProgressInLevel / 1000) * 100));

    return `
        <div class="progress-header">
            <div class="progress-title">
                ${Icons.trendingUp}
                <span>Tu Progreso</span>
            </div>

            <div class="progress-card">
                ${createCircularProgress(AppState.porcentaje)}

                <div class="progress-stats">
                    <div class="stat-row">
                        <span class="stat-label">Temas Dominados</span>
                        <span class="stat-value" style="color: #10b981;">${masteredCount} / ${totalCount}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Racha Actual</span>
                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                            ${Icons.award}
                            <span class="stat-value" style="color: #d97706;">1 día</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <div class="gamification-stats" style="margin-top: 1rem;">
                <div class="stats-card" style="background: white; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); border: 1px solid #e0e7ff;">
                    <div class="xp-progress-header" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        <div class="xp-label" style="display: flex; gap: 0.5rem; align-items: center; color: #1f2937; font-weight: 600;">
                            ${Icons.target}
                            <span>Nivel ${AppState.userLevel}</span>
                        </div>
                        <div class="xp-value" style="color: #6366f1; font-weight: 700;">${AppState.totalXP} XP</div>
                    </div>
                    <div class="progress-bar" style="height: 8px; background: #e0e7ff; border-radius: 4px; overflow: hidden; margin-bottom: 1rem;">
                        <div class="progress-fill" style="width: ${AppState.porcentaje}%; height: 100%; background: linear-gradient(to right, #6366f1, #a855f7); border-radius: 4px;"></div>
                    </div>

                    <div class="stat-items" style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="stat-item" style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                            <div class="stat-item-label" style="display: flex; gap: 0.5rem; color: #6b7280; align-items: center;">
                                <div class="stat-icon icon-amber" style="color: #d97706;">
                                    ${Icons.lightbulb}
                                </div>
                                <span>Pistas Usadas</span>
                            </div>
                            <div class="stat-item-value value-amber" style="color: #d97706; font-weight: 600;">0 / 5</div>
                        </div>
                        <div class="stat-item" style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                            <div class="stat-item-label" style="display: flex; gap: 0.5rem; color: #6b7280; align-items: center;">
                                <div class="stat-icon icon-emerald" style="color: #10b981;">
                                    ${Icons.zap}
                                </div>
                                <span>Bonus de Velocidad</span>
                            </div>
                            <div class="stat-item-value value-emerald" style="color: #10b981; font-weight: 600;">+0 XP</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="skill-tree-container">
            <h3 class="skill-tree-title">Ruta de Aprendizaje</h3>
            <div class="skill-tree">
                ${activeTopics.map((topic, index) => `
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
    mapElement.innerHTML = createLearningMap();

    const activeTopics = getDynamicTopics();

    const nodes = mapElement.querySelectorAll('.node-icon');
    nodes.forEach((node, index) => {
        if (activeTopics[index].state !== 'locked') {
            node.addEventListener('click', () => handleNodeClick(activeTopics[index].id));
        }
    });
}

