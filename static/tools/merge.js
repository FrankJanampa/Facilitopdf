// ================================
// 🔥 MERGE (UNIR PDF)
// ================================

let mergeFiles = [];

function renderMerge(panel){

    mergeFiles = [];

    panel.innerHTML = `
        <h3>Unir PDF</h3>

        <div class="drop-zone" id="merge-drop">
            Arrastra uno o varios PDFs o haz clic
            <input type="file" id="merge-file" accept="application/pdf" multiple hidden>
        </div>

        <div id="merge-preview"></div>

        <div class="actions">
            <button id="add-merge-btn" style="display:none;" onclick="triggerMerge()">+ Agregar PDF</button>
            <button id="merge-btn" onclick="submitMerge()">Descargar</button>
            <div id="merge-status" class="status-msg"></div>
        </div>
    `;

    setupMergeEvents();
}

// ================================
// 🔥 ABRIR SELECTOR
// ================================
function triggerMerge(){
    const input = document.getElementById("merge-file");
    if(input){
        input.value = "";
        input.click();
    }
}

// ================================
// 🔥 EVENTOS
// ================================
function setupMergeEvents(){

    const input = document.getElementById("merge-file");

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
        mergeFiles = mergeFiles.concat(validFiles);

        document.getElementById("merge-drop").style.display = "none";
        document.getElementById("add-merge-btn").style.display = "inline-block";

        renderMergePreview();

        const status = document.getElementById("merge-status");
        status.textContent = mergeFiles.length + " archivo(s) listo(s)";
    });
}

// ================================
// 🔥 PREVIEW + ORDENAR
// ================================
function renderMergePreview(){

    const preview = document.getElementById("merge-preview");

    if(!preview) return;

    preview.innerHTML = "";

    preview.style.display = "grid";
    preview.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
    preview.style.gap = "20px";

    mergeFiles.forEach((file, index) => {

        const canvas = document.createElement("canvas");

        canvas.draggable = true;
        canvas.dataset.index = index;

        canvas.style.width = "100%";
        canvas.style.borderRadius = "10px";
        canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
        canvas.style.cursor = "grab";

        preview.appendChild(canvas);

        // 🔥 DRAG
        canvas.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("index", index);
            canvas.style.opacity = "0.5";
        });

        canvas.addEventListener("dragend", () => {
            canvas.style.opacity = "1";
        });

        canvas.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        canvas.addEventListener("drop", (e) => {
            e.preventDefault();

            const from = parseInt(e.dataTransfer.getData("index"));
            const to = parseInt(canvas.dataset.index);

            if(from === to) return;

            const moved = mergeFiles.splice(from, 1)[0];
            mergeFiles.splice(to, 0, moved);

            renderMergePreview();
        });

        // 🔥 RENDER PDF
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