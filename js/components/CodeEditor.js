// Componente Code Editor
let codeEditorInstance = null;

const initialSnippets = {
    python: `# Ejemplo: Corregir el Bucle Infinito
def contar_hasta_diez():
    contador = 1
    while contador < 10:  # ⚠️ Problema aquí
        print(f"Número: {contador}")
        # ¿Qué falta para que el bucle termine?

    print("¡Completado!")

contar_hasta_diez()`,
    java: `import java.io.*;
// Ejemplo: Corregir el Bucle Infinito
public class Main {
    public static void main(String[] args) throws Exception {
        System.setOut(new PrintStream(System.out, true, "UTF-8"));
        int contador = 1;
        while (contador < 10) { // Problema: falta incrementar contador
            System.out.println("N\u00famero: " + contador);
            // \u00bfQue falta para que el bucle termine?
            // contador++;
        }
        System.out.println("\u00a1Completado!");
    }
}`
};

function createCodeEditor() {
    return `
        <div class="editor-header">
            <div class="editor-title-section">
                <div class="editor-icon">
                    ${Icons.fileCode}
                </div>
                <div class="editor-title">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <h3>Reto actual: Corregir el Bucle Infinito</h3>
                        <span class="difficulty-badge">Dificultad: Media</span>
                    </div>
                    <div class="editor-meta">
                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                            ${Icons.clock}
                            <span>Tiempo estimado: 10 min</span>
                        </div>
                        <div class="meta-separator"></div>
                        <select id="language-selector" onchange="changeLanguage()" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 5px; font-size: 0.75rem;">
                            <option value="python" style="color: black;">Python</option>
                            <option value="java" style="color: black;">Java</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="editor-actions">
                <button class="btn-execute" onclick="executeCode()">
                    ${Icons.play}
                    <span>Ejecutar Código</span>
                </button>
                <button class="btn-reset" onclick="resetCode()">
                    ${Icons.rotateCcw}
                    <span>Reiniciar</span>
                </button>
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
    editorElement.innerHTML = createCodeEditor();

    setTimeout(initCodeEditor, 0);
}

function initCodeEditor() {
    const container = document.getElementById('codemirror-container');
    if (!container) return;

    codeEditorInstance = CodeMirror(container, {
        value: initialSnippets.python,
        mode: "python",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true
    });
}

function changeLanguage() {
    const selector = document.getElementById('language-selector');
    const lang = selector.value;

    if (codeEditorInstance) {
        codeEditorInstance.setValue(initialSnippets[lang]);
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
            <span>Ejecutando código en los servidores de Piston...</span>
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
            throw new Error("Piston API requiere autorización (401 Unauthorized). Revisa las pautas.");
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
                    <span>Error al procesar la respuesta del servidor de compilación.</span>
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
        codeEditorInstance.setValue(initialSnippets[lang]);

        const consoleContainer = document.getElementById('console-output-lines');
        consoleContainer.innerHTML = `
            <div class="console-line normal">
                <span>Código reiniciado.</span>
            </div>
        `;
    }
}
