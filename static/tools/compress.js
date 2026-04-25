// ================================
// 🔥 COMPRESS (COMPRIMIR PDF)
// ================================

let compressFiles = [];

function renderCompress(panel){

    compressFiles = [];

    panel.innerHTML = `
        <h3>Comprimir PDF</h3>

        <div class="drop-zone" id="compress-drop">
            Arrastra uno o varios PDFs o haz clic
            <input type="file" id="compress-file" accept="application/pdf" multiple hidden>
        </div>

        <div id="compress-preview"></div>

        <div class="actions">
            <button id="add-compress-btn" style="display:none;" onclick="triggerCompress()">+ Agregar PDF</button>
            <button id="compress-btn" onclick="submitCompress()">Comprimir</button>
            <div id="compress-status" class="status-msg"></div>
        </div>
    `;

    setupCompressEvents();
}

// ================================
// 🔥 ABRIR SELECTOR
// ================================
function triggerCompress(){
    const input = document.getElementById("compress-file");
    if(input){
        input.value = "";
        input.click();
    }
}

// ================================
// 🔥 EVENTOS
// ================================
function setupCompressEvents(){

    const input = document.getElementById("compress-file");

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

        // 🔥 SOLO agregar válidos
        compressFiles = compressFiles.concat(validFiles);

        document.getElementById("compress-drop").style.display = "none";
        document.getElementById("add-compress-btn").style.display = "inline-block";

        renderCompressPreview();

        const status = document.getElementById("compress-status");
        status.textContent = compressFiles.length + " archivo(s) listo(s)";
    });
}
// ================================
// 🔥 PREVIEW (IGUAL QUE MERGE)
// ================================
function renderCompressPreview(){

    const preview = document.getElementById("compress-preview");

    if(!preview) return;

    preview.innerHTML = "";

    preview.style.display = "grid";
    preview.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
    preview.style.gap = "20px";

    compressFiles.forEach((file) => {

        const canvas = document.createElement("canvas");

        canvas.style.width = "100%";
        canvas.style.borderRadius = "10px";
        canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

        preview.appendChild(canvas);

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
    });
}