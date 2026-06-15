let difyConversationId = null;
let chatHistory = [];


function createTutorPanel() {
    return `
        <div class="tutor-resizer" id="tutor-resizer"></div>
        <button class="tutor-toggle-btn" id="tutor-toggle-btn" title="Ocultar/Mostrar Tutor">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="toggle-icon">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
        <div class="tutor-panel-inner">
            <div class="tutor-header">
                <div class="tutor-title">
                    <div class="tutor-icon">
                        ${Icons.brain}
                    </div>
                    <div class="tutor-title-text">
                        <h2>Tutor Socrático</h2>
                        <p>Guía inteligente</p>
                    </div>
                </div>
                <div class="reflection-badge">
                    <div class="pulse-dot"></div>
                    <span>Modo Reflexión</span>
                </div>
            </div>

            <div class="chat-history" id="chat-history-container">
                <div class="chat-messages" id="chat-messages">
                    ${chatHistory.map(msg => createChatMessage(msg)).join('')}
                </div>
            </div>

            <div class="input-area">
                <div class="input-wrapper">
                    <div class="input-icon">
                        ${Icons.sparkles}
                    </div>
                    <input
                        type="text"
                        class="reflection-input"
                        placeholder="Escribe tu reflexión aquí..."
                        id="reflection-input"
                        onkeypress="handleKeyPress(event)"
                    />
                    <button class="send-button" onclick="sendMessage()">
                        ${Icons.send}
                    </button>
                </div>
                <p class="input-hint">Reflexiona sobre el problema antes de ejecutar nuevamente</p>
            </div>
        </div>
    `;
}

async function loadChatHistory() {
    if (!AppState.usuario_id) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/history/${AppState.usuario_id}`);
        if (!response.ok) throw new Error('No se pudo obtener el historial de chat');
        
        const data = await response.json();
        difyConversationId = data.dify_conversation_id;
        
        if (data.mensajes && data.mensajes.length > 0) {
            chatHistory = data.mensajes.map(m => ({
                type: m.rol === 'assistant' ? 'ai' : 'user',
                text: m.contenido
            }));
            
            const chatMessagesContainer = document.getElementById('chat-messages');
            if (chatMessagesContainer) {
                chatMessagesContainer.innerHTML = chatHistory.map(msg => createChatMessage(msg)).join('');
                scrollToBottom();
            }
        }
    } catch (error) {
        console.error('Error al cargar historial de chat:', error);
    }
}

function renderTutorPanel() {
    const panelElement = document.getElementById('tutor-panel');
    panelElement.innerHTML = createTutorPanel();

    initResizer(panelElement);
    initToggle(panelElement);
    scrollToBottom();
    
    loadChatHistory();
}

function initResizer(panelElement) {
    const resizer = document.getElementById('tutor-resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const newWidth = window.innerWidth - e.clientX;

        if (newWidth >= 300 && newWidth <= 600) {
            panelElement.style.setProperty('--tutor-width', `${newWidth}px`);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('dragging');
            document.body.style.cursor = 'default';
        }
    });
}

function initToggle(panelElement) {
    const toggleBtn = document.getElementById('tutor-toggle-btn');
    const toggleIcon = document.getElementById('toggle-icon');

    toggleBtn.addEventListener('click', () => {
        panelElement.classList.toggle('collapsed');
        if (panelElement.classList.contains('collapsed')) {
            toggleIcon.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
        } else {
            toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
        }
    });
}

function scrollToBottom() {
    const container = document.getElementById('chat-history-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('reflection-input');
    const message = input.value.trim();
    const chatMessagesContainer = document.getElementById('chat-messages');

    if (!message) return;

    const userMsg = { type: 'user', text: message };
    chatHistory.push(userMsg);

    chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(userMsg));

    input.value = '';
    input.disabled = true;
    scrollToBottom();

    const loadingId = 'loading-' + Date.now();
    const loadingMsg = `
        <div class="chat-message ai" id="${loadingId}">
            <div class="message-avatar avatar-ai">
                ${Icons.brain}
            </div>
            <div class="message-content message-ai">
                <div class="message-header">
                    <span class="message-label">Tutor Socrático</span>
                </div>
                <p>...</p>
            </div>
        </div>
    `;
    chatMessagesContainer.insertAdjacentHTML('beforeend', loadingMsg);
    scrollToBottom();

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: AppState.usuario_id,
                mensaje: message,
                dify_conversation_id: difyConversationId,
                ejercicio_titulo: (typeof activeExercise !== 'undefined' && activeExercise) ? activeExercise.titulo : null,
                ejercicio_descripcion: (typeof activeExercise !== 'undefined' && activeExercise) ? activeExercise.descripcion : null,
                codigo_alumno: (typeof codeEditorInstance !== 'undefined' && codeEditorInstance) ? codeEditorInstance.getValue() : null
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();

        difyConversationId = data.dify_conversation_id;

        document.getElementById(loadingId).remove();

        const aiMsg = { type: 'ai', text: data.respuesta };
        chatHistory.push(aiMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(aiMsg));

    } catch (error) {
        console.error('Error al conectar con el backend:', error);

        document.getElementById(loadingId).remove();

        const errorMsg = { type: 'ai', text: 'Lo siento, hubo un error al conectar con el servidor. Verifica que el backend esté corriendo en localhost:8000 y tenga configurada la API Key.' };
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(errorMsg));
    } finally {
        input.disabled = false;
        input.focus();
        scrollToBottom();
    }
}

async function sendAutomatedTutorMessage(text, visibleUserText) {
    const chatMessagesContainer = document.getElementById('chat-messages');
    if (!chatMessagesContainer) return;

    if (visibleUserText) {
        const userMsg = { type: 'user', text: visibleUserText };
        chatHistory.push(userMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(userMsg));
        scrollToBottom();
    }

    const loadingId = 'loading-' + Date.now();
    const loadingMsg = `
        <div class="chat-message ai" id="${loadingId}">
            <div class="message-avatar avatar-ai">
                ${Icons.brain}
            </div>
            <div class="message-content message-ai">
                <div class="message-header">
                    <span class="message-label">Tutor Socrático</span>
                </div>
                <p>...</p>
            </div>
        </div>
    `;
    chatMessagesContainer.insertAdjacentHTML('beforeend', loadingMsg);
    scrollToBottom();

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: AppState.usuario_id,
                mensaje: text,
                dify_conversation_id: difyConversationId,
                ejercicio_titulo: (typeof activeExercise !== 'undefined' && activeExercise) ? activeExercise.titulo : null,
                ejercicio_descripcion: (typeof activeExercise !== 'undefined' && activeExercise) ? activeExercise.descripcion : null,
                codigo_alumno: (typeof codeEditorInstance !== 'undefined' && codeEditorInstance) ? codeEditorInstance.getValue() : null
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        difyConversationId = data.dify_conversation_id;

        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        const aiMsg = { type: 'ai', text: data.respuesta };
        chatHistory.push(aiMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(aiMsg));

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        const errorMsg = { type: 'ai', text: 'Lo siento, hubo un error al obtener la retroalimentación del Tutor Socrático.' };
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(errorMsg));
    } finally {
        scrollToBottom();
    }
}
