function createSkillNode(topic) {
    const { id, title, state } = topic;

    const stateClasses = {
        'locked': 'node-locked',
        'available': 'node-available',
        'current': 'node-current',
        'mastered': 'node-mastered'
    };

    const nodeClass = stateClasses[state] || 'node-locked';

    let content = '';
    if (state === 'locked') {
        content = Icons.lock;
    } else if (state === 'mastered') {
        content = Icons.check;
    } else {
        content = `<span>${title.slice(0, 2).toUpperCase()}</span>`;
    }

    const badge = state === 'current' ? `<div class="node-badge">${Icons.sparkles}</div>` : '';

    return `
        <div class="skill-node" data-topic-id="${id}">
            <div class="node-icon ${nodeClass}" ${state !== 'locked' ? 'style="cursor: pointer;"' : ''}>
                ${badge}
                ${content}
            </div>
            <div class="node-title ${state === 'current' ? 'font-bold' : ''}">${title}</div>
        </div>
    `;
}

function handleNodeClick(topicId) {
    console.log(`Nodo clickeado: ${topicId}`);
}
