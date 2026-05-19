// Componente Chat Message
function createChatMessage(message) {
    const { type, text } = message;
    const isAI = type === 'ai';

    return `
        <div class="chat-message ${type}">
            <div class="message-avatar ${isAI ? 'avatar-ai' : 'avatar-user'}">
                ${isAI ? Icons.bot : Icons.user}
            </div>
            <div class="message-content ${isAI ? 'message-ai' : 'message-user'}">
                ${isAI ? `
                    <div class="message-header">
                        ${Icons.sparkles}
                        <span class="message-label">Profesor IA</span>
                    </div>
                ` : ''}
                <p class="message-text">${text}</p>
            </div>
        </div>
    `;
}
