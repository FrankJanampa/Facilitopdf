// ================================
// 🔥 PDF → WORD
// ================================

let pdfWordFiles = [];

function renderPdfword(panel){

    pdfWordFiles = [];

    panel.innerHTML = `
        <h3>PDF a Word</h3>

        <div class="drop-zone">
            Arrastra uno o varios PDFs o haz clic
            <input type="file" id="pdfword-file" accept="application/pdf" multiple hidden>
        </div>

        <div id="pdfword-preview"></div>

        <div class="actions">
            <button id="add-pdfword-btn" style="display:none;" onclick="triggerPdfword()">+ Agregar PDF</button>
            <button id="pdfword-btn" onclick="submitPdfWord()">Convertir</button>
            <div id="pdfword-status" class="status-msg"></div>
        </div>
    `;

    setupPdfwordEvents();
}

// ================================
function triggerPdfword(){
    const input = document.getElementById("pdfword-file");
    if(input){
        input.value = "";
        input.click();
    }
}

// ================================
function setupPdfwordEvents(){

    const input = document.getElementById("pdfword-file");

    input.addEventListener("change", function(){

        const newFiles = Array.from(input.files);
        pdfWordFiles = pdfWordFiles.concat(newFiles);

        document.querySelector(".drop-zone").style.display = "none";
        document.getElementById("add-pdfword-btn").style.display = "inline-block";

        renderPdfwordPreview();

        const status = document.getElementById("pdfword-status");
        status.textContent = pdfWordFiles.length + " archivo(s) listo(s)";
    });
}

// ================================
// 🔥 PREVIEW SIMPLE (ESTABLE)
// ================================
function renderPdfwordPreview(){

    const preview = document.getElementById("pdfword-preview");

    if(!preview) return;

    preview.innerHTML = "";

    preview.style.display = "grid";
    preview.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
    preview.style.gap = "20px";

    pdfWordFiles.forEach((file) => {

        const canvas = document.createElement("canvas");

        canvas.style.width = "100%";
        canvas.style.borderRadius = "10px";
        canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

        preview.appendChild(canvas);

        const reader = new FileReader();

        reader.onload = function(){

            try{
                const typedarray = new Uint8Array(this.result);

                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    pdf.getPage(1).then(page => {

                        const viewport = page.getViewport({ scale: 1 });
                        const context = canvas.getContext("2d");

                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        page.render({
                            canvasContext: context,
                            viewport: viewport
                        });
                    });
                });

            }catch(e){
                console.log("Preview error", e);
            }
        };

        reader.readAsArrayBuffer(file);
    });
}