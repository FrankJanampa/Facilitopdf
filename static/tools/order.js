// ================================
// 🔥 RENDER ORDER
// ================================
function renderOrder(panel){
    panel.innerHTML = `
        <h3>Ordenar PDF</h3>

        <div class="drop-zone">
            Arrastra tu PDF o haz clic
            <input type="file" id="order-file" hidden>
        </div>

        <div id="order-preview" class="preview"></div>

        <div id="order-info" class="order-info"></div>

        <div class="actions">
            <button id="order-btn" onclick="downloadOrder()">Descargar</button>
            <div id="order-status" class="status-msg"></div>
        </div>
    `;
}

// ================================
// 🔥 CARGAR PDF
// ================================
document.addEventListener("change", async function(e){

    if(e.target.id === "order-file"){

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

                // 🔥 limpiar preview
                const preview = document.getElementById("order-preview");
                preview.innerHTML = "";

                // 🔥 limpiar input
                document.getElementById("order-file").value = "";

                return;
            }
            const preview = document.getElementById("order-preview");

            preview.innerHTML = "";

            for(let i = 1; i <= pdf.numPages; i++){

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale: 0.8});

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const div = document.createElement("div");
                div.classList.add("page");
                div.setAttribute("draggable", true);
                div.dataset.page = i;

                div.appendChild(canvas);

                preview.appendChild(div);
            }

            updateOrderInfo();
        };

        reader.readAsArrayBuffer(file);
    }

});

// ================================
// 🔥 DRAG & DROP
// ================================
let dragged = null;

document.addEventListener("dragstart", function(e){
    if(e.target.classList.contains("page")){
        dragged = e.target;
        e.target.style.opacity = "0.5";
        e.target.style.transform = "scale(1.05)";
    }
});

document.addEventListener("dragend", function(e){
    if(e.target.classList.contains("page")){
        e.target.style.opacity = "1";
        e.target.style.transform = "scale(1)";
        updateOrderInfo();
    }
});

document.addEventListener("dragover", function(e){
    e.preventDefault();
});

document.addEventListener("drop", function(e){
    e.preventDefault();

    const target = e.target.closest(".page");

    if(target && dragged && target !== dragged){
        const container = target.parentNode;
        container.insertBefore(dragged, target);
    }
});

// ================================
// 🔥 MOSTRAR ORDEN
// ================================
function updateOrderInfo(){

    const pages = document.querySelectorAll("#order-preview .page");

    const order = [];

    pages.forEach(el => {
        order.push(el.dataset.page);
    });

    const info = document.getElementById("order-info");

    if(info){
        info.innerText = "Orden actual: " + order.join(", ");
    }
}

// ================================
// 🔥 DESCARGAR
// ================================
function downloadOrder(){

    const status = document.getElementById("order-status");
    const button = document.getElementById("order-btn");

    const pages = document.querySelectorAll("#order-preview .page");

    if(pages.length === 0){
        alert("Carga un PDF primero");
        return;
    }

    const order = [];

    pages.forEach(el => {
        order.push(parseInt(el.dataset.page));
    });

    const fileInput = document.getElementById("order-file");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("order", JSON.stringify(order));

    // 🔥 DESHABILITAR BOTÓN
    button.disabled = true;
    button.innerText = "Procesando...";

    status.textContent = "Procesando...";

    fetch("/order-pages", {
        method: "POST",
        body: formData
    })
    .then(res => res.blob())
    .then(blob => {

        status.textContent = "Descargando...";

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pdf_ordenado.pdf";
        a.click();

        // 🔥 RESTAURAR BOTÓN
        button.disabled = false;
        button.innerText = "Descargar";

        setTimeout(() => {
            status.textContent = "";
        }, 2000);

    })
    .catch(() => {
        status.textContent = "Error al procesar";

        button.disabled = false;
        button.innerText = "Descargar";
    });
}