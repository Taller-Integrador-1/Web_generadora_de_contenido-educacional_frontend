function createSkillNode(topic) {
    const { id, title, state } = topic;

    const stateClasses = {
        'locked': 'node-locked',
        'available': 'node-available',
        'current': 'node-current',
        'mastered': 'node-mastered'
    };

    let nodeClass = stateClasses[state] || 'node-locked';

    const isSelected = title === AppState.currentTopic;
    if (isSelected) {
        nodeClass += ' node-selected';
    }

    let content = '';
    if (state === 'locked') {
        content = Icons.lock;
    } else if (state === 'mastered') {
        content = Icons.check;
    } else {
        content = `<span>${title.slice(0, 2).toUpperCase()}</span>`;
    }

    const badge = state === 'current' ? `<div class="node-badge">${Icons.sparkles}</div>` : '';

    const isClickable = state === 'mastered' || state === 'current';

    return `
        <div class="skill-node" data-topic-id="${id}">
            <div class="node-icon ${nodeClass}" ${isClickable ? 'style="cursor: pointer;"' : ''}>
                ${badge}
                ${content}
            </div>
            <div class="node-title ${state === 'current' ? 'font-bold' : ''}" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <span>${title}</span>
                <span class="retos-count-badge" style="font-size: 0.7rem; color: #94a3b8; font-weight: normal; margin-top: 2px;">
                    Cargando...
                </span>
            </div>
        </div>
    `;
}

function handleNodeClick(topicId) {
    const topicIndex = parseInt(topicId) - 1;
    const topicTitle = allTopicsList[topicIndex];
    if (!topicTitle) return;

    console.log(`Nodo clickeado: ${topicTitle}`);

    AppState.currentTopic = topicTitle;

    renderLearningMap();

    if (typeof loadExercisesForTopic === 'function') {
        loadExercisesForTopic(topicTitle);
    }
}
