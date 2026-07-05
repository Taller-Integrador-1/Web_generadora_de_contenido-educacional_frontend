let difyConversationId = null;
let chatHistory = [];
let hintCount = 0;


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
                        <h2>Tutor Agéntico</h2>
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
                <button class="tutor-hint-btn" id="tutor-hint-btn" onclick="requestHintAction()">
                    <span style="display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                        ${Icons.lightbulb}
                    </span>
                    <span>Pedir Pista (Costo: <span id="hint-xp-cost">25</span> XP)</span>
                </button>
                <div class="input-wrapper">
                    <div class="input-icon">
                        ${Icons.sparkles}
                    </div>
                    <textarea
                        class="reflection-input"
                        placeholder="Escribe tu reflexión aquí..."
                        id="reflection-input"
                        onkeydown="handleKeyPress(event)"
                    ></textarea>
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
    updateHintButtonUI();
}

function initResizer(panelElement) {
    const resizer = document.getElementById('tutor-resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const newWidth = window.innerWidth - e.clientX;
        const maxTutorWidth = window.innerWidth - 288;

        if (newWidth >= 300 && newWidth <= maxTutorWidth) {
            panelElement.style.setProperty('--tutor-width', `${newWidth}px`);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('dragging');
            document.body.style.cursor = 'default';
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
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
        if (!event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
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
    const loadingMsg = getAgentLoadingHTML(loadingId);
    chatMessagesContainer.insertAdjacentHTML('beforeend', loadingMsg);
    animateAgentCollaboration(loadingId);
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
                codigo_alumno: (typeof codeEditorInstance !== 'undefined' && codeEditorInstance) ? codeEditorInstance.getValue() : null,
                pista_numero: null
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();

        difyConversationId = data.dify_conversation_id;

        document.getElementById(loadingId).remove();

        const aiMsg = { type: 'ai', text: data.respuesta, agentName: data.agente_nombre };
        chatHistory.push(aiMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(aiMsg));

    } catch (error) {
        console.error('Error al conectar con el backend:', error);

        document.getElementById(loadingId).remove();

        const errorMsg = { type: 'ai', text: 'Lo siento, hubo un error al conectar con el servidor.' };
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(errorMsg));
    } finally {
        input.disabled = false;
        input.focus();
        scrollToBottom();
    }
}

async function sendAutomatedTutorMessage(text, visibleUserText, pistaNumero = null) {
    const chatMessagesContainer = document.getElementById('chat-messages');
    if (!chatMessagesContainer) return;

    if (visibleUserText) {
        const userMsg = { type: 'user', text: visibleUserText };
        chatHistory.push(userMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(userMsg));
        scrollToBottom();
    }

    const loadingId = 'loading-' + Date.now();
    const loadingMsg = getAgentLoadingHTML(loadingId);
    chatMessagesContainer.insertAdjacentHTML('beforeend', loadingMsg);
    animateAgentCollaboration(loadingId);
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
                codigo_alumno: (typeof codeEditorInstance !== 'undefined' && codeEditorInstance) ? codeEditorInstance.getValue() : null,
                pista_numero: pistaNumero
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        difyConversationId = data.dify_conversation_id;

        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        const aiMsg = { type: 'ai', text: data.respuesta, agentName: data.agente_nombre };
        chatHistory.push(aiMsg);
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(aiMsg));

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        const errorMsg = { type: 'ai', text: 'Lo siento, hubo un error al obtener la retroalimentación del Tutor Agéntico.' };
        chatMessagesContainer.insertAdjacentHTML('beforeend', createChatMessage(errorMsg));
    } finally {
        scrollToBottom();
    }
}

function getAgentLoadingHTML(loadingId) {
    return `
        <div class="chat-message ai" id="${loadingId}">
            <div class="message-avatar avatar-ai">
                ${Icons.brain}
            </div>
            <div class="message-content message-ai" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--bg-tertiary); max-width: max-content;">
                <div class="chat-spinner"></div>
                <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">Pensando...</span>
            </div>
        </div>
    `;
}

function animateAgentCollaboration(loadingId) {

}

function resetHintCounter() {
    hintCount = 0;
    updateHintButtonUI();
}

function updateHintButtonUI() {
    const cost = getHintCost();
    const costElem = document.getElementById('hint-xp-cost');
    if (costElem) {
        costElem.innerText = cost;
    }
    const hintBtn = document.getElementById('tutor-hint-btn');
    if (hintBtn) {
        const hasActive = (typeof activeExercise !== 'undefined' && activeExercise);
        if (!hasActive) {
            hintBtn.disabled = true;
            hintBtn.title = 'Selecciona un reto para pedir pistas';
        } else {
            hintBtn.disabled = false;
            hintBtn.title = '';
        }
    }
}

function getHintCost() {
    if (hintCount === 0) return 25;
    if (hintCount === 1) return 50;
    return 100;
}

async function requestHintAction() {
    const hasActive = (typeof activeExercise !== 'undefined' && activeExercise);
    if (!hasActive) {
        alert('Por favor selecciona un reto primero.');
        return;
    }
    
    const cost = getHintCost();
    if (AppState.totalXP < cost) {
        alert(`No tienes suficiente XP para pedir esta pista. Costo: ${cost} XP, tienes: ${AppState.totalXP} XP.`);
        return;
    }
    
    const confirmDeduct = confirm(`Pedir una pista costará ${cost} XP y podría afectar tu nivel si bajas de rango. ¿Deseas continuar?`);
    if (!confirmDeduct) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/usuario/descontar-xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: AppState.usuario_id,
                descuento_xp: cost
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al descontar XP');
        }
        
        const data = await response.json();
        
        reloadStudentStats({
            xp: data.xp,
            nivel: data.nivel,
            porcentaje: AppState.porcentaje,
            tema_actual: AppState.tema_actual
        });
        
        hintCount++;
        updateHintButtonUI();
        
        const promptMsg = `Tengo dificultades con el reto "${activeExercise.titulo}" en el tema "${AppState.tema_actual}". ¿Me das una pista (pista #${hintCount}) sobre cómo abordar este problema?`;
        
        await sendAutomatedTutorMessage(promptMsg, `Solicito pista #${hintCount} (-${cost} XP)`, hintCount);
        
    } catch (e) {
        console.error('Error al pedir pista:', e);
        alert('Hubo un error al procesar el descuento de XP. Por favor intenta de nuevo.');
    }
}
