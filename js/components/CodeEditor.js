let codeEditorInstance = null;
let activeExercise = null;
let currentTopicExercises = [];

const initialSnippets = {
    python: `# Sube un sílabo en el panel de administración para comenzar
# o selecciona un tema desbloqueado de la ruta de aprendizaje.`,
    java: `// Sube un sílabo en el panel de administración para comenzar
// o selecciona un tema desbloqueado de la ruta de aprendizaje.`
};

function createCodeEditor() {
    return `
        <div class="editor-header">
            <div class="editor-title-section">
                <div class="editor-icon">
                    ${Icons.fileCode}
                </div>
                <div class="editor-title">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <h3 id="current-reto-title">Sin retos activos</h3>
                        <span class="difficulty-badge" id="current-reto-difficulty">Dificultad: -</span>
                    </div>
                    <div class="editor-meta" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                            ${Icons.clock}
                            <span>Tiempo estimado: 10 min</span>
                        </div>
                        <div class="meta-separator"></div>
                        <select id="language-selector" onchange="changeLanguage()" class="editor-select">
                            <option value="java" selected>Java</option>
                            <option value="python">Python</option>
                        </select>
                        <div id="exercise-select-wrapper" style="margin-left: 0.5rem; display: none;">
                            <select id="exercise-selector" onchange="selectExercise(this.value)" class="editor-select">
                                <!-- Cargado dinámicamente -->
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="editor-actions">
                <button class="btn-execute" onclick="executeCode()">
                    ${Icons.play}
                    <span>Ejecutar Código</span>
                </button>
                <button class="btn-validate" id="btn-validate-ia" onclick="validateCodeWithIA()" style="display: none; background: #4f46e5; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 0.375rem; font-weight: 700; cursor: pointer; align-items: center; justify-content: center; gap: 0.35rem; transition: transform 0.2s;">
                    ${Icons.sparkles}
                    <span>Validar con IA</span>
                </button>
                <button class="btn-reset" onclick="resetCode()">
                    ${Icons.rotateCcw}
                    <span>Reiniciar</span>
                </button>
            </div>
        </div>

        <!-- Caja de Descripción del Reto -->
        <div class="reto-description-box" id="current-reto-description-box" style="margin: 1rem 1rem 0 1rem; padding: 1rem; background: var(--description-box-bg); border: 1px solid var(--description-box-border); border-radius: 0.75rem; color: var(--description-box-color); font-size: 0.85rem; line-height: 1.5; display: none; transition: background 0.3s, border-color 0.3s, color 0.3s;">
            <div style="font-weight: 700; color: #a855f7; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
                ${Icons.lightbulb}
                <span>Descripción del Reto</span>
            </div>
            <p id="current-reto-description" style="margin: 0; color: var(--description-text-color); font-weight: 400; white-space: pre-wrap; transition: color 0.3s;"></p>
            
            <div id="current-reto-casos-prueba-section" style="margin-top: 0.75rem; border-top: 1px dashed var(--description-dashed-border); padding-top: 0.5rem; display: none; transition: border-color 0.3s;">
                <div style="font-weight: 700; color: #6366f1; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
                    ${Icons.target}
                    <span>Casos de Prueba de Validación</span>
                </div>
                <div id="current-reto-casos-prueba" style="margin: 0; font-family: monospace; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; transition: color 0.3s;"></div>
            </div>
        </div>

        <div class="code-area" id="codemirror-container">
            <!-- CodeMirror se inyectará aquí -->
        </div>

        <div class="console-output">
            <div class="console-header">
                <div class="console-title">
                    <div class="console-icon-wrapper">
                        ${Icons.alertCircle}
                    </div>
                    <span>Consola de Salida</span>
                </div>
                <div class="console-indicators">
                    <div class="indicator indicator-error"></div>
                    <div class="indicator indicator-warning"></div>
                    <div class="indicator indicator-idle"></div>
                </div>
            </div>
            <div class="console-content" id="console-output-lines">
                <div class="console-line normal">
                    <span>Presiona "Ejecutar Código" para ver la salida.</span>
                </div>
            </div>
        </div>
    `;
}

function renderCodeEditor() {
    const editorElement = document.getElementById('code-editor');
    if (editorElement) {
        editorElement.innerHTML = createCodeEditor();
        setTimeout(initCodeEditor, 0);
    }
}

function initCodeEditor() {
    const container = document.getElementById('codemirror-container');
    if (!container) return;

    codeEditorInstance = CodeMirror(container, {
        value: initialSnippets.java,
        mode: "text/x-java",
        theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dracula' : 'default',
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true
    });

    if (AppState.currentTopic) {
        loadExercisesForTopic(AppState.currentTopic);
    } else {
        loadExercisesForTopic(null);
    }
}

async function loadExercisesForTopic(topicTitle) {
    if (!topicTitle) {
        activeExercise = null;
        removeExerciseSelector();

        const titleElem = document.getElementById('current-reto-title');
        if (titleElem) titleElem.innerText = `Sin retos activos`;

        const diffElem = document.getElementById('current-reto-difficulty');
        if (diffElem) diffElem.innerText = `Dificultad: -`;

        const descBox = document.getElementById('current-reto-description-box');
        if (descBox) descBox.style.display = 'none';

        const validateBtn = document.getElementById('btn-validate-ia');
        if (validateBtn) {
            validateBtn.style.display = 'none';
        }

        resetCode();
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/exercises/${encodeURIComponent(topicTitle)}?usuario_id=${encodeURIComponent(AppState.usuario_id)}`);
        if (!response.ok) throw new Error('Error al obtener retos del tema');
        currentTopicExercises = await response.json();

        if (currentTopicExercises && currentTopicExercises.length > 0) {
            const isCurrentTopic = AppState.currentTopic === AppState.tema_actual;
            let activeIdx = 0;
            if (isCurrentTopic) {
                activeIdx = currentTopicExercises.findIndex(ex => !ex.resuelto);
                if (activeIdx === -1) {
                    activeIdx = currentTopicExercises.length - 1;
                }
            }

            loadChallenge(currentTopicExercises[activeIdx]);
            addExerciseSelector(currentTopicExercises);

            const selector = document.getElementById('exercise-selector');
            if (selector) {
                selector.value = activeIdx;
            }
        } else {
            activeExercise = null;
            removeExerciseSelector();

            const titleElem = document.getElementById('current-reto-title');
            if (titleElem) titleElem.innerText = `Sin retos activos`;

            const diffElem = document.getElementById('current-reto-difficulty');
            if (diffElem) diffElem.innerText = `Dificultad: -`;

            const descBox = document.getElementById('current-reto-description-box');
            const casesSection = document.getElementById('current-reto-casos-prueba-section');
            if (descBox) descBox.style.display = 'none';
            if (casesSection) casesSection.style.display = 'none';

            const validateBtn = document.getElementById('btn-validate-ia');
            if (validateBtn) {
                validateBtn.style.display = 'none';
            }

            resetCode();
        }
    } catch (error) {
        console.error('Error al cargar retos:', error);
    }
}

function loadChallenge(exercise) {
    activeExercise = exercise;

    if (typeof resetHintCounter === 'function') {
        resetHintCounter();
    }

    const titleElem = document.getElementById('current-reto-title');
    if (titleElem) titleElem.innerText = `Reto: ${exercise.titulo}`;

    const diffElem = document.getElementById('current-reto-difficulty');
    if (diffElem) diffElem.innerText = `Dificultad: ${exercise.dificultad}`;

    const validateBtn = document.getElementById('btn-validate-ia');
    if (validateBtn) {
        validateBtn.style.display = 'inline-flex';
    }

    const descBox = document.getElementById('current-reto-description-box');
    const descElem = document.getElementById('current-reto-description');
    const casesSection = document.getElementById('current-reto-casos-prueba-section');
    const casesElem = document.getElementById('current-reto-casos-prueba');

    if (descBox && descElem && exercise.descripcion) {
        descElem.innerText = exercise.descripcion;
        descBox.style.display = 'block';

        if (casesSection && casesElem) {
            if (exercise.casos_prueba) {
                try {
                    let cases = exercise.casos_prueba;
                    if (typeof cases === 'string') {
                        try {
                            cases = JSON.parse(cases);
                        } catch (e) {
                        }
                    }

                    if (Array.isArray(cases) && cases.length > 0) {
                        const formattedCases = cases.map((c, i) => {
                            let inpStr = "";
                            if (typeof c.input === 'object' && c.input !== null) {
                                inpStr = Object.entries(c.input).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
                            } else {
                                inpStr = JSON.stringify(c.input);
                            }
                            return `Caso ${i + 1}: Entrada (${inpStr}) → Salida Esperada: ${JSON.stringify(c.output)}`;
                        }).join('<br>');

                        casesElem.innerHTML = formattedCases;
                        casesSection.style.display = 'block';
                    } else if (typeof cases === 'string' && cases.trim() !== "" && cases !== "Ejecutar y validar la salida del programa.") {
                        casesElem.innerText = cases;
                        casesSection.style.display = 'block';
                    } else {
                        casesSection.style.display = 'none';
                    }
                } catch (err) {
                    console.error("Error al formatear casos de prueba:", err);
                    casesSection.style.display = 'none';
                }
            } else {
                casesSection.style.display = 'none';
            }
        }
    } else if (descBox) {
        descBox.style.display = 'none';
    }

    const lang = document.getElementById('language-selector').value;
    if (codeEditorInstance) {
        const code = lang === 'python'
            ? (exercise.codigo_inicial_python || '# Escribe tu código aquí')
            : (exercise.codigo_inicial_java || '// Escribe tu código aquí');

        codeEditorInstance.setValue(code);

        if (lang === 'java') {
            codeEditorInstance.setOption('mode', 'text/x-java');
        } else {
            codeEditorInstance.setOption('mode', 'python');
        }
    }
}

function addExerciseSelector(exercises) {
    const wrapper = document.getElementById('exercise-select-wrapper');
    const selector = document.getElementById('exercise-selector');

    if (wrapper && selector) {
        const isCurrentTopic = AppState.currentTopic === AppState.tema_actual;

        selector.innerHTML = exercises.map((ex, idx) => {
            let isLocked = false;
            if (isCurrentTopic && idx > 0) {
                isLocked = !exercises[idx - 1].resuelto;
            }
            const disabledAttr = isLocked ? 'disabled' : '';
            const lockIcon = isLocked ? ' 🔒 (Bloqueado)' : '';
            return `
                <option value="${idx}" ${disabledAttr} style="color: ${isLocked ? 'var(--text-muted)' : 'var(--text-primary)'}; background: var(--card-bg);">
                    Reto ${idx + 1}: ${ex.titulo}${lockIcon}
                </option>
            `;
        }).join('');
        wrapper.style.display = 'inline-block';
    }
}

function removeExerciseSelector() {
    const wrapper = document.getElementById('exercise-select-wrapper');
    if (wrapper) {
        wrapper.style.display = 'none';
    }
}

function selectExercise(index) {
    const idx = parseInt(index);
    if (currentTopicExercises && currentTopicExercises[idx]) {
        const isCurrentTopic = AppState.currentTopic === AppState.tema_actual;
        if (isCurrentTopic && idx > 0) {
            const isLocked = !currentTopicExercises[idx - 1].resuelto;
            if (isLocked) {
                alert("Debes completar y aprobar los retos anteriores primero.");
                const selector = document.getElementById('exercise-selector');
                if (selector) {
                    const activeIdx = currentTopicExercises.indexOf(activeExercise);
                    selector.value = activeIdx >= 0 ? activeIdx : 0;
                }
                return;
            }
        }
        loadChallenge(currentTopicExercises[idx]);
    }
}

function changeLanguage() {
    const selector = document.getElementById('language-selector');
    const lang = selector.value;

    if (codeEditorInstance) {
        if (activeExercise) {
            const code = lang === 'python'
                ? (activeExercise.codigo_inicial_python || '# Escribe tu código aquí')
                : (activeExercise.codigo_inicial_java || '// Escribe tu código aquí');

            codeEditorInstance.setValue(code);
        } else {
            const code = initialSnippets[lang] || "";
            codeEditorInstance.setValue(code);
        }

        if (lang === 'java') {
            codeEditorInstance.setOption('mode', 'text/x-java');
        } else {
            codeEditorInstance.setOption('mode', 'python');
        }
    }
}

async function executeCode() {
    if (!codeEditorInstance) return;

    const code = codeEditorInstance.getValue();
    const lang = document.getElementById('language-selector').value;
    const consoleContainer = document.getElementById('console-output-lines');

    consoleContainer.innerHTML = `
        <div class="console-line normal">
            <span>Ejecutando código en los servidores...</span>
        </div>
    `;

    const pistonLang = lang === 'python' ? 'python' : 'java';
    const pistonVersion = lang === 'python' ? '3.10.0' : '15.0.2';

    try {
        let codeToSend = code;
        if (lang === 'java') {
            codeToSend = codeToSend.replace(/[^\x00-\x7F]/g, (char) => {
                return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
            });

            if (!codeToSend.includes('setOut') && !codeToSend.includes('UTF-8')) {
                codeToSend = codeToSend.replace(
                    /public static void main\(String\[\] args\)([^{]*){/,
                    'public static void main(String[] args) throws Exception {\n        System.setOut(new java.io.PrintStream(System.out, true, "UTF-8"));'
                );
            }
        }

        const response = await fetch(`${API_BASE_URL}/api/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: pistonLang,
                version: pistonVersion,
                files: [
                    { name: lang === 'java' ? 'Main.java' : 'main.py', content: codeToSend }
                ]
            })
        });

        if (response.status === 401) {
            throw new Error("API requiere autorización.");
        }

        const data = await response.json();

        if (data.compile && data.compile.stderr) {
            const compileLines = data.compile.stderr.split('\n').filter(l => l.trim() !== '');
            consoleContainer.innerHTML = `
                <div class="console-line error">
                    ${Icons.alertCircle}
                    <span><strong>Error de compilación:</strong></span>
                </div>
            ` + compileLines.map(line => `
                <div class="console-line error">
                    <span style="white-space: pre-wrap; word-break: break-all;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                </div>
            `).join('');
        } else if (data.run) {
            let output = data.run.stdout || data.run.stderr;
            let type = data.run.code !== 0 ? 'error' : 'normal';

            if (!output || output.trim() === '') {
                if (data.run.signal === 'SIGKILL' || data.run.message === 'Time limit exceeded') {
                    output = '[Error] Tiempo límite excedido. El programa tardó demasiado en ejecutarse.';
                    type = 'error';
                } else {
                    output = '[Ejecución completada sin salida]';
                }
            }

            const lines = output.split('\n').filter(l => l.trim() !== '');
            consoleContainer.innerHTML = lines.map(line => `
                <div class="console-line ${type}">
                    ${type === 'error' ? Icons.alertCircle : ''}
                    <span style="white-space: pre-wrap; word-break: break-all;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                </div>
            `).join('');
        } else {
            consoleContainer.innerHTML = `
                <div class="console-line error">
                    ${Icons.alertCircle}
                    <span>Error al procesar la respuesta del servidor.</span>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error executing code:", error);
        consoleContainer.innerHTML = `
            <div class="console-line error">
                ${Icons.alertCircle}
                <span>Error de conexión: ${error.message}</span>
            </div>
        `;
    }
}

function resetCode() {
    const lang = document.getElementById('language-selector').value;
    if (codeEditorInstance) {
        if (activeExercise) {
            const code = lang === 'python'
                ? (activeExercise.codigo_inicial_python || '# Escribe tu código aquí')
                : (activeExercise.codigo_inicial_java || '// Escribe tu código aquí');

            codeEditorInstance.setValue(code);
        } else {
            const code = initialSnippets[lang] || "";
            codeEditorInstance.setValue(code);
        }

        const consoleContainer = document.getElementById('console-output-lines');
        if (consoleContainer) {
            consoleContainer.innerHTML = `
                <div class="console-line normal">
                    <span>Código reiniciado.</span>
                </div>
            `;
        }
    }
}

async function validateCodeWithIA() {
    if (!codeEditorInstance || !activeExercise) return;

    const code = codeEditorInstance.getValue();
    const lang = document.getElementById('language-selector').value;
    const consoleContainer = document.getElementById('console-output-lines');
    const validateBtn = document.getElementById('btn-validate-ia');

    if (validateBtn) {
        validateBtn.disabled = true;
        validateBtn.style.opacity = '0.7';
    }

    consoleContainer.innerHTML = `
        <div class="console-line normal">
            <span style="color: #6366f1; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                ${Icons.play}
                Paso 1: Ejecutando tu código localmente...
            </span>
        </div>
    `;

    const pistonLang = lang === 'python' ? 'python' : 'java';
    const pistonVersion = lang === 'python' ? '3.10.0' : '15.0.2';

    try {
        let codeToSend = code;
        if (lang === 'java') {
            codeToSend = codeToSend.replace(/[^\x00-\x7F]/g, (char) => {
                return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
            });
            if (!codeToSend.includes('setOut') && !codeToSend.includes('UTF-8')) {
                codeToSend = codeToSend.replace(
                    /public static void main\(String\[\] args\)([^{]*){/,
                    'public static void main(String[] args) throws Exception {\n        System.setOut(new java.io.PrintStream(System.out, true, "UTF-8"));'
                );
            }
        }

        const runResponse = await fetch(`${API_BASE_URL}/api/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: pistonLang,
                version: pistonVersion,
                files: [{ name: lang === 'java' ? 'Main.java' : 'main.py', content: codeToSend }]
            })
        });

        if (!runResponse.ok) throw new Error("Error al ejecutar el código en el compilador.");
        const runData = await runResponse.json();

        let consoleOutput = "";
        let isCompileError = false;

        if (runData.compile && runData.compile.stderr) {
            consoleOutput = runData.compile.stderr;
            isCompileError = true;
        } else if (runData.run) {
            consoleOutput = runData.run.stdout || runData.run.stderr || "";
            if (runData.run.code !== 0 && !consoleOutput) {
                consoleOutput = "[Error de ejecución]";
            }
        }

        let formattedOutputLines = consoleOutput.split('\n').filter(l => l.trim() !== '');
        consoleContainer.innerHTML = `
            <div class="console-line normal">
                <span><strong>Salida del programa:</strong></span>
            </div>
        ` + (formattedOutputLines.length > 0 ? formattedOutputLines.map(line => `
            <div class="console-line ${isCompileError ? 'error' : 'normal'}">
                <span style="white-space: pre-wrap; word-break: break-all;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
            </div>
        `).join('') : `
            <div class="console-line normal">
                <span>[Ejecución completada sin salida en consola]</span>
            </div>
        `);

        if (isCompileError || (runData.run && runData.run.code !== 0)) {
            consoleContainer.innerHTML += `
                <div class="console-line error" style="margin-top: 0.5rem; border-top: 1px dashed rgba(239, 68, 68, 0.3); padding-top: 0.5rem;">
                    ${Icons.alertCircle}
                    <span><strong>Validación abortada:</strong> Corrige los errores antes de validar con IA.</span>
                </div>
            `;
            if (validateBtn) {
                validateBtn.disabled = false;
                validateBtn.style.opacity = '1';
            }
            return;
        }

        consoleContainer.innerHTML += `
            <div class="console-line normal" style="margin-top: 0.5rem; border-top: 1px dashed rgba(99, 102, 241, 0.3); padding-top: 0.5rem;">
                <span class="pulse-animation" style="color: #a855f7; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                    ${Icons.sparkles}
                    Paso 2: Evaluando código con Dify AI...
                </span>
            </div>
        `;

        const validateResponse = await fetch(`${API_BASE_URL}/api/exercises/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: AppState.usuario_id || "UPAO-123",
                ejercicio_id: activeExercise.id,
                resolucion_codigo: code,
                resultado_consola: consoleOutput
            })
        });

        if (!validateResponse.ok) throw new Error("Error al conectar con la API de validación.");
        const valResult = await validateResponse.json();

        const feedbackLines = valResult.feedback.split('\n');
        const valColor = valResult.is_correct ? '#10b981' : '#ef4444';
        const valIcon = valResult.is_correct ? Icons.award : Icons.alertCircle;

        consoleContainer.innerHTML += `
            <div class="console-line" style="margin-top: 0.75rem; border-top: 2px solid ${valColor}; padding-top: 0.75rem; color: ${valColor}; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                ${valIcon}
                <span>Resultado: ${valResult.is_correct ? 'CORRECTO (¡Reto Superado!)' : 'REVISAR SOLUCIÓN'}</span>
            </div>
        ` + feedbackLines.map(line => `
            <div class="console-line" style="color: ${valResult.is_correct ? '#065f46' : '#991b1b'}; background: ${valResult.is_correct ? '#ecfdf5' : '#fef2f2'}; border-radius: 4px; padding: 4px 8px; margin-top: 0.25rem;">
                <span style="white-space: pre-wrap; word-break: break-all;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
            </div>
        `).join('');

        if (!valResult.is_correct) {
            const failKey = `consecutive_failures_${AppState.usuario_id}_${activeExercise.id}`;
            let currentFails = parseInt(localStorage.getItem(failKey) || "0") + 1;
            localStorage.setItem(failKey, currentFails.toString());

            const tutorPanel = document.getElementById('tutor-panel');
            if (tutorPanel && tutorPanel.classList.contains('collapsed')) {
                tutorPanel.classList.remove('collapsed');
                const toggleIcon = document.getElementById('toggle-icon');
                if (toggleIcon) {
                    toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
                }
            }

            if (typeof sendAutomatedTutorMessage === 'function') {
                const visibleUserText = `Mi código para el reto "${activeExercise.titulo}" no pasó la validación. ¿Por qué falló y cómo puedo solucionarlo?`;
                const systemPrompt = `Mi código para el reto "${activeExercise.titulo}" no pasó la validación de la IA.\nLa retroalimentación del evaluador es:\n"${valResult.feedback}"\n\nPor favor, analízalo de forma socrática, guíame para entender qué parte de mi código está mal y cómo puedo corregirla sin darme la solución directamente.`;
                sendAutomatedTutorMessage(systemPrompt, visibleUserText);
            }

            if (currentFails >= 3) {
                const topics = (typeof allTopicsList !== 'undefined' && allTopicsList.length > 0)
                    ? allTopicsList
                    : ["Variables", "Tipos de Datos", "Operadores", "Condicionales", "Bucles For", "Bucles While", "Funciones", "Arrays", "Objetos"];
                const currentIdx = topics.indexOf(AppState.tema_actual);
                const prevTopic = currentIdx > 0 ? topics[currentIdx - 1] : null;

                setTimeout(() => {
                    showRegressionModal(prevTopic);
                }, 1000);
            }
        } else {
            const failKey = `consecutive_failures_${AppState.usuario_id}_${activeExercise.id}`;
            localStorage.removeItem(failKey);
        }

        if (valResult.is_correct && valResult.user_stats) {
            triggerConfettiEffect();

            const oldTopic = AppState.currentTopic;

            if (typeof reloadStudentStats === 'function') {
                reloadStudentStats(valResult.user_stats);
            }

            const newTopic = AppState.currentTopic;

            if (newTopic === oldTopic) {
                const currentIdx = currentTopicExercises.findIndex(ex => ex.id === activeExercise.id);
                await loadExercisesForTopic(newTopic);

                if (currentIdx !== -1 && currentIdx + 1 < currentTopicExercises.length) {
                    selectExercise(currentIdx + 1);
                    const selector = document.getElementById('exercise-selector');
                    if (selector) {
                        selector.value = currentIdx + 1;
                    }
                }
            } else {
                await loadExercisesForTopic(newTopic);
            }
        }

    } catch (error) {
        console.error("Error during IA validation:", error);
        consoleContainer.innerHTML += `
            <div class="console-line error" style="margin-top: 0.5rem; border-top: 1px dashed rgba(239, 68, 68, 0.3); padding-top: 0.5rem;">
                ${Icons.alertCircle}
                <span><strong>Error de conexión:</strong> ${error.message}</span>
            </div>
        `;
    } finally {
        if (validateBtn) {
            validateBtn.disabled = false;
            validateBtn.style.opacity = '1';
        }
    }
}

function showRegressionModal(prevTopic) {
    let modal = document.getElementById('regression-modal-container');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'regression-modal-container';
    modal.style = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh; 
        background: rgba(15, 12, 30, 0.8); 
        backdrop-filter: blur(8px); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 9999; 
        padding: 1.5rem; 
        animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); width: 100%; max-width: 500px; border-radius: 1.5rem; padding: 2rem; box-shadow: var(--card-shadow); color: var(--text-primary); transition: background 0.3s, color 0.3s; display: flex; flex-direction: column; gap: 1.5rem; animation: scaleIn 0.3s ease-out;">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; color: #f59e0b;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0;">¿Necesitas ayuda con este reto?</h3>
            </div>
            
            <!-- Body -->
            <div style="font-size: 0.9rem; line-height: 1.5;">
                <p>Hemos notado que has tenido varios intentos fallidos consecutivos en el reto <strong>${activeExercise ? activeExercise.titulo : ''}</strong>.</p>
                <p style="margin-top: 0.75rem; font-weight: 700; color: var(--text-secondary);">Te recomendamos:</p>
                <ul style="margin-top: 0.5rem; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem;">
                    ${prevTopic ? `<li>Repasar los conceptos del tema anterior (<strong>${prevTopic}</strong>) regresando al nivel correspondiente.</li>` : ''}
                    <li>Pedir ayuda específica o pistas adicionales al Tutor Inteligente en el chat lateral.</li>
                </ul>
            </div>
            
            <!-- Footer/Actions -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1.25rem; margin-top: 0.25rem;">
                ${prevTopic ? `
                <button onclick="regressToTopic('${prevTopic}')" style="background: linear-gradient(to right, #f59e0b, #d97706); color: white; border: none; border-radius: 0.75rem; padding: 0.8rem 1.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; outline: none; width: 100%;">
                    Regresar al tema anterior (${prevTopic})
                </button>
                ` : ''}
                <button onclick="closeRegressionModalAndAskHelp()" style="background: linear-gradient(to right, #6366f1, #9333ea); color: white; border: none; border-radius: 0.75rem; padding: 0.8rem 1.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; outline: none; width: 100%;">
                    Pedir pistas en el chat
                </button>
                <button onclick="closeRegressionModal()" style="background: none; border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 0.75rem; padding: 0.8rem 1.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; outline: none; width: 100%;">
                    Seguir intentando solo
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function regressToTopic(topicName) {
    if (!AppState.usuario_id) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${AppState.usuario_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tema_actual: topicName,
                porcentaje: 0
            })
        });

        if (!response.ok) throw new Error('Error al actualizar tema actual');
        const data = await response.json();

        if (typeof reloadStudentStats === 'function') {
            reloadStudentStats(data);
        }

        closeRegressionModal();

        if (activeExercise) {
            const key = `consecutive_failures_${AppState.usuario_id}_${activeExercise.id}`;
            localStorage.removeItem(key);
        }

        alert(`Has regresado al tema: ${topicName}. ¡Mucho éxito en tu repaso!`);

    } catch (err) {
        console.error('Error al hacer regresión:', err);
        alert('Hubo un problema al intentar cambiar de nivel. Por favor, intenta de nuevo.');
    }
}

function closeRegressionModalAndAskHelp() {
    closeRegressionModal();

    const chatInput = document.getElementById('reflection-input');
    if (chatInput) {
        chatInput.value = `Tengo dificultades con el reto "${activeExercise ? activeExercise.titulo : ''}" en el tema "${AppState.tema_actual}". ¿Me das una pista sobre cómo abordar este problema?`;
        chatInput.focus();

        const tutorPanel = document.getElementById('tutor-panel');
        if (tutorPanel && tutorPanel.classList.contains('collapsed')) {
            tutorPanel.classList.remove('collapsed');
            const toggleIcon = document.getElementById('toggle-icon');
            if (toggleIcon) {
                toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
            }
        }
    }
}

function closeRegressionModal() {
    const modal = document.getElementById('regression-modal-container');
    if (modal) {
        modal.remove();
    }
}

window.showRegressionModal = showRegressionModal;
window.regressToTopic = regressToTopic;
window.closeRegressionModalAndAskHelp = closeRegressionModalAndAskHelp;
window.closeRegressionModal = closeRegressionModal;
