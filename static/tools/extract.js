function renderExtract(panel){

    panel.innerHTML = `
        <h3>Extraer páginas</h3>

        <div class="drop-zone">
            Arrastra tu PDF o haz clic
            <input type="file" id="extract-file" hidden>
        </div>

        <div id="preview" class="preview"></div>

        <div class="actions">
            <button id="extract-btn" onclick="downloadExtract()">Descargar páginas</button>
        </div>

        <div id="status-msg" class="status-msg"></div>
    `;
}
document.addEventListener("change", async function(e){

    if(e.target.id === "extract-file"){

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async function(){

            let pdf;

            try {
                pdf = await pdfjsLib.getDocument({data: reader.result}).promise;

                if (!pdf || pdf.numPages === 0) {
                    throw new Error("PDF inválido");
                }

            } catch (err) {
                alert("El archivo PDF está dañado o no es válido");

                // limpiar preview
                // limpiar input

                return;
            }
            const preview = document.getElementById("preview");

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
                div.dataset.page = i;

                // 🔥 círculo selector
                const selector = document.createElement("div");
                selector.classList.add("selector");

                // agregar canvas luego
                div.appendChild(selector);
                div.appendChild(canvas);

                preview.appendChild(div);

            }

        };

        reader.readAsArrayBuffer(file);
    }

});

function downloadExtract(){

    const status = document.getElementById("status-msg");
    const button = document.getElementById("extract-btn");

    const selected = document.querySelectorAll(".page.selected");

    if(selected.length === 0){
        alert("Selecciona al menos una página");
        return;
    }

    const pages = [];

    selected.forEach(el => {
        pages.push(parseInt(el.dataset.page));
    });

    const fileInput = document.getElementById("extract-file");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("pages", JSON.stringify(pages));

    // 🔥 DESHABILITAR BOTÓN
    button.disabled = true;
    button.innerText = "Procesando...";

    status.textContent = "Procesando...";

    fetch("/extract-pages", {
        method: "POST",
        body: formData
    })
    .then(res => res.blob())
    .then(blob => {

        status.textContent = "Descargando...";

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        if(pages.length === 1){
            a.download = "pagina.pdf";
        } else {
            a.download = "paginas.zip";
        }

        a.click();

        // 🔥 RESTAURAR BOTÓN
        button.disabled = false;
        button.innerText = "Descargar páginas";

        setTimeout(() => {
            status.textContent = "";
        }, 2000);

    })
    .catch(() => {
        status.textContent = "Error al procesar";

        button.disabled = false;
        button.innerText = "Descargar páginas";
    });
}

document.addEventListener("click", function(e){

    const page = e.target.closest(".page");

    if(page){

        page.classList.toggle("selected");

        const selector = page.querySelector(".selector");

        if(page.classList.contains("selected")){
            selector.innerHTML = "✓";
        } else {
            selector.innerHTML = "";
        }
    }

});