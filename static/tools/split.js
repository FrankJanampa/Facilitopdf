let splitFiles = [];

function renderSplit(panel){
    // 🔥 LIMPIAR ESTADO (ESTO ES SUFICIENTE)
    splitFiles = []
    panel.innerHTML = `
        <h3>Dividir PDF</h3>

        <div class="drop-zone" id="split-drop">
            Arrastra uno o varios PDFs o haz clic
            <input type="file" id="split-file" accept="application/pdf" multiple hidden>
        </div>

        <div id="split-preview"></div>

        <div class="actions" style="margin-top:20px;">
            <button id="add-pdf-btn" style="display:none;" onclick="triggerAddPDF()">+ Agregar PDF</button>
            <button id="split-btn" onclick="processSplit()">Descargar</button>
            <div id="split-status" class="status-msg"></div>
        </div>
    `;

    setupSplitEvents();
}

// ================================
// 🔥 EVENTS
// ================================
function setupSplitEvents(){

    const input = document.getElementById("split-file");

    input.addEventListener("change", async function(){

        const newFiles = Array.from(input.files);
        const validFiles = [];

        for (let file of newFiles) {

            try {
                const buffer = await file.arrayBuffer();

                const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

                // 🔥 validación real
                if (!pdf || pdf.numPages === 0) {
                    throw new Error("PDF inválido");
                }

                validFiles.push(file);

            } catch (err) {
                alert("Uno de los archivos está dañado o no es un PDF válido");
            }
        }

        // 🔥 ACUMULAR SOLO LOS VÁLIDOS
        splitFiles = splitFiles.concat(validFiles);

        const preview = document.getElementById("split-preview");

        // 🔥 ocultar drop-zone
        document.getElementById("split-drop").style.display = "none";

        // 🔥 mostrar botón agregar
        const addBtn = document.getElementById("add-pdf-btn");
        if(addBtn){
            addBtn.style.display = "inline-block";
        }

        preview.innerHTML = "";

        preview.style.display = "grid";
        preview.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
        preview.style.gap = "20px";

        for(let file of splitFiles){

            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "center";

            const canvas = document.createElement("canvas");

            canvas.style.width = "100%";
            canvas.style.borderRadius = "10px";
            canvas.style.cursor = "pointer";
            canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            canvas.style.transition = "transform 0.2s ease";

            canvas.onmouseenter = () => {
                canvas.style.transform = "scale(1.05)";
            };

            canvas.onmouseleave = () => {
                canvas.style.transform = "scale(1)";
            };

            container.appendChild(canvas);
            preview.appendChild(container);

            // 🔥 render portada
            const reader = new FileReader();

            reader.onload = async function(){

                const typedarray = new Uint8Array(this.result);

                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 1 });

                const context = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
            };

            reader.readAsArrayBuffer(file);
        }
    });
}

// ================================
// 🔥 PROCESAR
// ================================
function processSplit(){

    const input = document.getElementById("split-file");
    const files = splitFiles;

    const status = document.getElementById("split-status");
    const button = document.getElementById("split-btn");

    if(files.length === 0){
        alert("Carga al menos un PDF");
        return;
    }

    const formData = new FormData();

    for(let file of files){
        formData.append("pdfs", file);
    }

    button.disabled = true;
    button.innerText = "Procesando...";
    status.textContent = "Procesando...";

    fetch("/split-pdf", {
        method: "POST",
        body: formData
    })
    .then(res => res.blob())
    .then(blob => {

        status.textContent = "Descargando...";

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pdf_dividido.zip";
        a.click();

        button.disabled = false;
        button.innerText = "Descargar";

        setTimeout(()=>{
            status.textContent = "";
        }, 2000);
    })
    .catch(()=>{
        status.textContent = "Error al dividir";
        button.disabled = false;
        button.innerText = "Descargar";
    });
}


function triggerAddPDF(){

    const input = document.getElementById("split-file");

    if(input){
        input.value = ""; // 🔥 clave para permitir recargar mismo archivo
        input.click();
    }
}