
// ================================
// 🔥 RENDER SIGN
// ================================
function renderSign(panel){
    panel.innerHTML = `
        <h3>Firmar PDF</h3>

        <div class="sign-controls">
            <button onclick="document.getElementById('sign-pdf').click()">Seleccionar PDF</button>
            <button onclick="document.getElementById('sign-image').click()">Seleccionar firma</button>

            <input type="file" id="sign-pdf" accept="application/pdf" hidden>
            <input type="file" id="sign-image" accept="image/*" hidden>
        </div>

        <div id="pdf-viewer" class="pdf-viewer"></div>

        <div class="actions">
            <button id="sign-btn" onclick="downloadSigned()">Descargar</button>
            <div id="sign-status" class="status-msg"></div>
        </div>
    `;
    setTimeout(() => {
        setupSignEvents();
    }, 0);
}

// ================================
// 🔥 CARGAR PDF
// ================================
document.addEventListener("change", async function(e){

    if(e.target.id === "sign-pdf"){

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async function(){

            let pdf;

            try {
                pdf = await pdfjsLib.getDocument({data: reader.result}).promise;

                // 🔥 validación real
                if (!pdf || pdf.numPages === 0) {
                    throw new Error("PDF inválido");
                }

            } catch (err) {
                alert("El archivo PDF está dañado o no es válido");

                // 🔥 limpiar visor (IMPORTANTE)
                const viewer = document.getElementById("pdf-viewer");
                viewer.innerHTML = "";

                // 🔥 limpiar input (clave para reintentar)
                document.getElementById("sign-pdf").value = "";

                return;
            }
            const viewer = document.getElementById("pdf-viewer");

            viewer.innerHTML = "";

            for(let i = 1; i <= pdf.numPages; i++){

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1 });

                const canvas = document.createElement("canvas");
                canvas._viewport = viewport;

                const context = canvas.getContext("2d");

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const pageDiv = document.createElement("div");
                pageDiv.classList.add("pdf-page");
                pageDiv.dataset.page = i;

                pageDiv.appendChild(canvas);
                viewer.appendChild(pageDiv);
            }
        };

        reader.readAsArrayBuffer(file);
    }

});

// ================================
// 🔥 CARGAR FIRMA
// ================================
function setupSignEvents(){

    const imageInput = document.getElementById("sign-image");

    let activeSignature = null;

    imageInput.addEventListener("change", function(){

        const file = imageInput.files[0];
        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(){

            if(activeSignature){
                activeSignature.style.pointerEvents = "none";
                activeSignature = null;
            }

            const firstPage = document.querySelector(".pdf-page");

            if(!firstPage){
                alert("Primero carga un PDF");
                return;
            }

            const img = document.createElement("img");
            img.src = reader.result;
            img.classList.add("signature");

            img.style.position = "absolute";
            img.style.top = "40px";
            img.style.left = "40px";
            img.style.width = "150px";
            img.style.cursor = "grab";
            img.style.userSelect = "none";
            img.style.zIndex = "10";

            const canvas = firstPage.querySelector("canvas");
            canvas.parentElement.appendChild(img);

            // ================================
            // 🔥 BOTÓN DUPLICAR (SEGURO)
            // ================================
            const btn = document.createElement("div");
            btn.innerText = "+";
            btn.className = "duplicate-btn";

            btn.style.position = "absolute";
            btn.style.top = "-10px";
            btn.style.right = "-10px";
            btn.style.background = "rgba(0,0,0,0.6)";
            btn.style.color = "#fff";
            btn.style.borderRadius = "50%";
            btn.style.width = "24px";
            btn.style.height = "24px";
            btn.style.display = "flex";
            btn.style.alignItems = "center";
            btn.style.justifyContent = "center";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "bold";
            btn.style.zIndex = "20";

            img.parentElement.appendChild(btn);
            btn.style.left = img.style.left;
            btn.style.top = img.style.top;
            img._duplicateBtn = btn; // 🔥 ESTA ES LA CLAVE

            btn.addEventListener("click", function(ev){
                ev.stopPropagation();

                // ================================
                // 🔥 CREAR FIRMA NUEVA (NO CLONAR)
                // ================================
                const clone = document.createElement("img");
                clone.src = img.src;
                clone.classList.add("signature");

                clone.style.position = "absolute";
                clone.style.left = (parseFloat(this.style.left) + 20) + "px";
                clone.style.top = (parseFloat(this.style.top) + 20) + "px";
                clone.style.width = img.style.width;
                clone.style.cursor = "grab";
                clone.style.userSelect = "none";
                clone.style.zIndex = "10";

                this.parentElement.appendChild(clone);

                // ================================
                // 🔥 CREAR BOTÓN NUEVO (CLAVE)
                // ================================
                const newBtn = document.createElement("div");
                newBtn.innerText = "+";
                newBtn.className = "duplicate-btn";

                newBtn.style.position = "absolute";
                newBtn.style.background = "rgba(0,0,0,0.6)";
                newBtn.style.color = "#fff";
                newBtn.style.borderRadius = "50%";
                newBtn.style.width = "24px";
                newBtn.style.height = "24px";
                newBtn.style.display = "flex";
                newBtn.style.alignItems = "center";
                newBtn.style.justifyContent = "center";
                newBtn.style.cursor = "pointer";
                newBtn.style.fontWeight = "bold";
                newBtn.style.zIndex = "20";

                newBtn.style.left = clone.style.left;
                newBtn.style.top = clone.style.top;

                clone.parentElement.appendChild(newBtn);

                // 🔥 vincular correctamente
                clone._duplicateBtn = newBtn;

                // 🔥 IMPORTANTE: reutiliza la misma lógica (recursivo limpio)
                newBtn.addEventListener("click", arguments.callee);

                makeDraggable(clone);
            });
            activeSignature = img;

            makeDraggable(img);

            imageInput.value = "";
        };

        reader.readAsDataURL(file);
    });
}

// ================================
// 🔥 DRAG ESTABLE (FIX FINAL PRO)
// ================================
function makeDraggable(el){

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let currentPage = el.parentElement;

    // ================================
    // 🔥 SINCRONIZAR BOTÓN CON FIRMA
    // ================================
    function syncButton(){
        let btn = el._duplicateBtn;

        if(!btn) return;

        btn.style.left = el.style.left;
        btn.style.top = el.style.top;

        // 🔥 SIEMPRE mover (CLAVE DEL FIX)
        el.parentElement.appendChild(btn);
    }

    el.addEventListener("mousedown", (e)=>{
        dragging = true;

        const rect = el.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        el.style.cursor = "grabbing";
        el.style.transform = "scale(1.05)";

        e.preventDefault();
    });

    document.addEventListener("mousemove", (e)=>{
        if(!dragging) return;

        const pages = document.querySelectorAll(".pdf-page");

        pages.forEach(page => {
            const r = page.getBoundingClientRect();

            if(
                e.clientX >= r.left &&
                e.clientX <= r.right &&
                e.clientY >= r.top &&
                e.clientY <= r.bottom
            ){
                currentPage = page;
            }
        });

        if(!currentPage) return;

        const canvas = currentPage.querySelector("canvas");
        const rect = canvas.getBoundingClientRect();

        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top - offsetY;

        const maxX = canvas.clientWidth - el.offsetWidth;
        const maxY = canvas.clientHeight - el.offsetHeight;

        // 🔥 NO TOCAMOS TU LÓGICA ORIGINAL
        el.style.left = Math.max(0, Math.min(x, maxX)) + "px";
        el.style.top = Math.max(0, Math.min(y, maxY)) + "px";

        // 🔥 sincronización en tiempo real
        syncButton();
    });

    document.addEventListener("mouseup", ()=>{
        if(!dragging) return;

        dragging = false;

        if(currentPage){
            const canvas = currentPage.querySelector("canvas");

            // 🔥 NO TOCAMOS ESTO (CRÍTICO PARA POSICIÓN FINAL)
            canvas.parentElement.appendChild(el);

            // 🔥 sincronización final (clave para cambio de página)
            syncButton();
        }

        el.style.cursor = "grab";
        el.style.transform = "scale(1)";
    });

    el.addEventListener("wheel", function(e){
        if(e.target !== el) return;

        e.preventDefault();

        let w = el.offsetWidth + (e.deltaY < 0 ? 10 : -10);

        el.style.width = Math.max(50, Math.min(w, 400)) + "px";
    }, { passive: false });
}

// ================================
// 🔥 GUARDAR FIRMAS (CORRECTO)
// ================================
function saveSignatures(){

    signatures = [];

    document.querySelectorAll(".signature").forEach(sig => {

        const page = sig.parentElement;
        if(!page || !page.classList.contains("pdf-page")) return;

        const canvas = page.querySelector("canvas");
        const viewport = canvas._viewport;

        const rectCanvas = canvas.getBoundingClientRect();
        const rectSig = sig.getBoundingClientRect();

        const x = rectSig.left - rectCanvas.left;
        const y = rectSig.top - rectCanvas.top;

        // 🔥 SOLUCIÓN REAL
        const [pdfX, pdfY] = viewport.convertToPdfPoint(
            x,
            y + sig.offsetHeight
        );

        const width = sig.offsetWidth * (viewport.width / canvas.clientWidth);
        const height = sig.offsetHeight * (viewport.height / canvas.clientHeight);

        signatures.push({
            page: parseInt(page.dataset.page),
            x: pdfX,
            y: pdfY,
            width,
            height,
            src: sig.src
        });

    });
}

// ================================
// 🔥 DESCARGAR
// ================================
function downloadSigned(){

    const status = document.getElementById("sign-status");
    const button = document.getElementById("sign-btn");

    saveSignatures();

    if(signatures.length === 0){
        alert("Agrega al menos una firma");
        return;
    }

    const fileInput = document.getElementById("sign-pdf");
    const file = fileInput.files[0];

    if(!file){
        alert("Carga un PDF primero");
        return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("signatures", JSON.stringify(signatures));

    button.disabled = true;
    button.innerText = "Procesando...";
    status.textContent = "Procesando...";

    fetch("/sign-pdf", {
        method: "POST",
        body: formData
    })
    .then(res => res.blob())
    .then(blob => {

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pdf_firmado.pdf";
        a.click();

        button.disabled = false;
        button.innerText = "Descargar";

        setTimeout(()=> status.textContent = "", 2000);
    })
    .catch(() => {
        status.textContent = "Error al firmar";
        button.disabled = false;
        button.innerText = "Descargar";
    });
}