from flask import Flask, render_template, request, send_file, after_this_request, jsonify
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import os
import json
import zipfile
import uuid


app = Flask(__name__)

from routes.tools import tools_bp
from routes.blog import blog_bp

app.register_blueprint(tools_bp)
app.register_blueprint(blog_bp)

app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024

@app.route("/")
def home():
    return render_template("index.html")

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "El archivo supera el límite de 100 MB"}), 413

# 🔥 FUNCIÓN GLOBAL SEGURA (NO rompe nada)
def safe_delete(path):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except:
        pass

# =========================
# 🔹 DIVIDIR PDF
# =========================
@app.route("/split-pdf", methods=["POST"])
def split_pdf():

    from flask import request, send_file
    import io
    import zipfile
    from pypdf import PdfReader, PdfWriter

    files = request.files.getlist("pdfs")

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:

        for file in files:

            filename = file.filename.replace(".pdf", "")

            reader = PdfReader(file)

            for i, page in enumerate(reader.pages):

                writer = PdfWriter()
                writer.add_page(page)

                pdf_bytes = io.BytesIO()
                writer.write(pdf_bytes)
                pdf_bytes.seek(0)

                # 🔥 limpiar buffer del PDF (CLAVE)
                clean_pdf = io.BytesIO(pdf_bytes.read())
                clean_pdf.seek(0)

                zip_path = f"{filename}/pagina_{i+1}.pdf"

                zipf.writestr(zip_path, clean_pdf.read())

    # 🔥 CLAVE: cerrar correctamente el zip
    zip_buffer.seek(0)

    # 🔥 MISMO FIX QUE USAMOS EN TODO
    clean_zip = io.BytesIO(zip_buffer.read())
    clean_zip.seek(0)

    return send_file(
        clean_zip,
        as_attachment=True,
        download_name="pdf_dividido.zip",
        mimetype="application/zip"
    )
# =========================
# 🔹 EXTRAER PÁGINAS
# =========================

@app.route("/extract-pages", methods=["POST"])
def extract_pages():

    from flask import request, send_file
    import json
    import io
    import zipfile
    from pypdf import PdfReader, PdfWriter

    file = request.files["pdf"]
    pages = json.loads(request.form["pages"])

    # 🔥 LEER BIEN EL PDF (CLAVE)
    file_bytes = file.read()
    pdf_stream = io.BytesIO(file_bytes)

    reader = PdfReader(pdf_stream)

    # ==================================================
    # 🔥 CASO 1: UNA SOLA PÁGINA → PDF DIRECTO
    # ==================================================
    if len(pages) == 1:

        writer = PdfWriter()
        writer.add_page(reader.pages[pages[0] - 1])

        output = io.BytesIO()
        writer.write(output)
        output.seek(0)

        # 🔥 CREAR BUFFER LIMPIO (CLAVE REAL)
        clean_pdf = io.BytesIO(output.read())
        clean_pdf.seek(0)

        return send_file(
            clean_pdf,
            as_attachment=True,
            download_name=f"pagina_{pages[0]}.pdf",
            mimetype="application/pdf"
        )

    # ==================================================
    # 🔥 CASO 2: VARIAS PÁGINAS → ZIP
    # ==================================================
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w") as zipf:

        for page_num in pages:

            writer = PdfWriter()
            writer.add_page(reader.pages[page_num - 1])

            pdf_bytes = io.BytesIO()
            writer.write(pdf_bytes)
            pdf_bytes.seek(0)

            zipf.writestr(
                f"pagina_{page_num}.pdf",
                pdf_bytes.read()
            )

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name="paginas_extraidas.zip",
        mimetype="application/zip"
    )
# =========================
# 🔹 ORDENAR PDF
# =========================
@app.route("/order-pages", methods=["POST"])
def order_pages():

    from flask import request, send_file
    import json
    import io
    from pypdf import PdfReader, PdfWriter

    file = request.files["pdf"]
    order = json.loads(request.form["order"])

    # 🔥 leer correctamente el PDF
    file_bytes = file.read()
    pdf_stream = io.BytesIO(file_bytes)

    reader = PdfReader(pdf_stream)
    writer = PdfWriter()

    # 🔥 aplicar nuevo orden
    for page_num in order:
        writer.add_page(reader.pages[page_num - 1])

    # 🔥 generar PDF limpio (SIN corrupción)
    output = io.BytesIO()
    writer.write(output)
    output.seek(0)

    clean_pdf = io.BytesIO(output.read())
    clean_pdf.seek(0)

    return send_file(
        clean_pdf,
        as_attachment=True,
        download_name="pdf_ordenado.pdf",
        mimetype="application/pdf"
    )


# =========================
# 🔹 FIRMAR PDF
# =========================
@app.route("/sign-pdf", methods=["POST"])
def sign_pdf():

    from flask import request, send_file
    import json
    import io
    import base64
    import fitz
    from PIL import Image

    file = request.files["pdf"]
    signatures = json.loads(request.form["signatures"])

    pdf_bytes = file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page in doc:
        page.clean_contents()

    for sig in signatures:
        page = doc[sig["page"] - 1]

        img_data = sig["src"].split(",")[1]
        img_bytes = base64.b64decode(img_data)

        image = Image.open(io.BytesIO(img_bytes)).convert("RGBA")

        img_buffer = io.BytesIO()
        image.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        x = sig["x"]
        y = sig["y"]
        width = sig["width"]
        height = sig["height"]

        page_height = page.rect.height

        rect = fitz.Rect(
            x,
            page_height - y - height,
            x + width,
            page_height - y
        )

        page.insert_image(rect, stream=img_buffer.read())

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="pdf_firmado.pdf",
        mimetype="application/pdf"
    )
# =========================
# 🔹 UNIR PDF
# =========================
@app.route("/merge-pdf", methods=["POST"])
def merge_pdf():

    from flask import request, send_file
    import io
    from pypdf import PdfReader, PdfWriter

    files = request.files.getlist("pdfs")

    writer = PdfWriter()

    for file in files:
        reader = PdfReader(file)
        for page in reader.pages:
            writer.add_page(page)

    output = io.BytesIO()
    writer.write(output)
    output.seek(0)

    clean = io.BytesIO(output.read())
    clean.seek(0)

    return send_file(
        clean,
        as_attachment=True,
        download_name="pdf_unido.pdf",
        mimetype="application/pdf"
    )


# =========================
# 🔹 COMPRIMIR
# =========================
@app.route("/compress", methods=["POST"])
def compress():

    from flask import request, send_file
    from io import BytesIO
    import zipfile
    import fitz  # PyMuPDF

    files = request.files.getlist("files")

    outputs = []

    for file in files:

        original_bytes = file.read()
        original_size = len(original_bytes)

        try:
            pdf = fitz.open(stream=original_bytes, filetype="pdf")

            # 🔥 1. COMPRESIÓN INTELIGENTE (MEJORADA)
            pdf.scrub()

            pdf.rewrite_images(
                dpi_threshold=120,   # más agresivo
                dpi_target=90,       # más reducción
                quality=35           # más compresión
            )

            temp_output = BytesIO()

            pdf.save(
                temp_output,
                garbage=4,
                deflate=True,
                clean=True
            )

            temp_bytes = temp_output.getvalue()

            # 🔥 2. SI NO REDUJO AL MENOS 25% → FORZAR
            if len(temp_bytes) > original_size * 0.75:

                # ⚠️ REABRIR ORIGINAL (CLAVE)
                pdf = fitz.open(stream=original_bytes, filetype="pdf")

                new_pdf = fitz.open()

                for page in pdf:
                    pix = page.get_pixmap(matrix=fitz.Matrix(0.35, 0.35))
                    img_bytes = pix.tobytes("jpeg", quality=30)

                    rect = page.rect

                    new_page = new_pdf.new_page(width=rect.width, height=rect.height)
                    new_page.insert_image(rect, stream=img_bytes)

                output = BytesIO()
                new_pdf.save(output, garbage=4, deflate=True)

            else:
                output = BytesIO(temp_bytes)

            output.seek(0)
            outputs.append((file.filename, output))

        except:
            # fallback: no romper PDF
            output = BytesIO(original_bytes)
            output.seek(0)
            outputs.append((file.filename, output))

    # uno solo
    if len(outputs) == 1:
        return send_file(
            outputs[0][1],
            as_attachment=True,
            download_name="compressed.pdf"
        )

    # múltiples → zip
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, "w") as z:
        for name, data in outputs:
            data.seek(0)
            z.writestr("compressed_" + name, data.read())

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name="compressed.zip"
    )

# =========================
# 🔹 PDF A WORD
# =========================
@app.route("/pdf-to-word", methods=["POST"])
def pdf_to_word():

    from flask import request, send_file
    from io import BytesIO
    from docx import Document
    import fitz  # PyMuPDF

    files = request.files.getlist("files")

    if not files:
        return "No file", 400

    file = files[0]

    try:
        pdf_bytes = file.read()
        pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

        doc = Document()

        # 🔥 extraer texto por página
        for page in pdf:
            text = page.get_text()

            if text.strip():
                doc.add_paragraph(text)

        output = BytesIO()
        doc.save(output)
        output.seek(0)

        return send_file(
            output,
            as_attachment=True,
            download_name=file.filename.replace(".pdf", "") + "_facilitopdf.docx"
        )

    except Exception as e:
        return str(e), 500

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route('/contacto')
def contacto():
    return render_template('contacto.html')

@app.route("/")
def index():
    return render_template("index.html")
@app.route("/blog")
def blog():
    return render_template("blog.html")

@app.route("/blog/guia")
def blog_guia():
    return render_template("blog_guia.html")

@app.route("/blog/seguridad")
def blog_seguridad():
    return render_template("blog_seguridad.html")

@app.route("/blog/productividad")
def blog_productividad():
    return render_template("blog_productividad.html")
from flask import send_from_directory

@app.route("/tools/split-pdf")
def split_page():
    return render_template("tools/split.html")

@app.route("/tools/merge-pdf")
def merge_page():
    return render_template("tools/merge.html")

@app.route("/tools/compress-pdf")
def compress_page():
    return render_template("tools/compress.html")

@app.route("/tools/extract-pdf")
def extract_page():
    return render_template("tools/extract.html")

@app.route("/tools/order-pdf")
def order_page():
    return render_template("tools/order.html")

@app.route("/tools/sign-pdf")
def sign_page():
    return render_template("tools/sign.html")
