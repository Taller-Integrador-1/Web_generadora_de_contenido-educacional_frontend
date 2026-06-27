function formatMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
        try {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            return marked.parse(text);
        } catch (e) {
            console.error('Error formatting markdown with marked:', e);
        }
    }
    return text.replace(/\n/g, '<br>');
}

function createChatMessage(message) {
    const { type, text, agentName } = message;
    const isAI = type === 'ai';

    let iconHtml = Icons.bot;
    let displayName = 'Profesor IA';

    if (isAI) {
        if (agentName) {
            displayName = agentName;
            if (agentName.includes('Técnico')) {
                iconHtml = Icons.code;
            } else if (agentName.includes('Pedagógico')) {
                iconHtml = Icons.brain;
            } else if (agentName.includes('Socrático')) {
                iconHtml = Icons.sparkles;
            }
        } else {
            iconHtml = Icons.sparkles;
        }
    }

    return `
        <div class="chat-message ${type}">
            <div class="message-avatar ${isAI ? 'avatar-ai' : 'avatar-user'}">
                ${isAI ? iconHtml : Icons.user}
            </div>
            <div class="message-content ${isAI ? 'message-ai' : 'message-user'}">
                ${isAI ? `
                    <div class="message-header">
                        <span class="message-label" style="display: flex; align-items: center; gap: 0.25rem; font-weight: 700; color: var(--text-primary);">
                            ${displayName}
                        </span>
                    </div>
                ` : ''}
                <div class="message-text markdown-body">${formatMarkdown(text)}</div>
            </div>
        </div>
    `;
}
