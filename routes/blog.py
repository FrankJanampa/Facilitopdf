from flask import Blueprint, render_template

# =========================
# 🔥 BLUEPRINT
# =========================
blog_bp = Blueprint('blog', __name__)

# =========================
# 🔥 ARTÍCULOS (BLOG)
# =========================

@blog_bp.route("/articulos/7-cosas-pdf")
def cosas_pdf():
    return render_template("blog/cosas_que_debes_saber.html")

@blog_bp.route("/blog/trucos-secretos")
def trucos_secretos():
    return render_template("blog/trucos_secretos.html")

@blog_bp.route("/blog/el-error")
def el_error():
    return render_template("blog/el_error.html")

@blog_bp.route("/blog/perdi-una-hora-intentando")
def perdi_una_hora():
    return render_template("blog/perdi_una_hora_intentando.html")

@blog_bp.route("/blog/usa-mal-celular")
def usa_mal_celular():
    return render_template("blog/usa_mal_los_celulares.html")

@blog_bp.route("/blog/crei-haber-enviado")
def crei_haber_enviado():
    return render_template("blog/crei_haber_enviado.html")

# =========================
# 🔥 RARTÍCULOS ANTIGUOS
# =========================

@blog_bp.route("/recursos/productividad")
def recurso_productividad():
    return render_template("blog_productividad.html")


@blog_bp.route("/recursos/seguridad")
def recurso_seguridad():
    return render_template("blog_seguridad.html")


@blog_bp.route("/recursos/guia")
def recurso_guia():
    return render_template("blog_guia.html")


# =========================
# 🔥 DATA PLANTILLAS
# =========================

plantillas = [

    {
        "slug": "curriculum-vitae",
        "titulo": "Modelo curriculum vitae Word",
        "descripcion": "Descarga un CV profesional listo para editar en Word.",
        "preview": "curriculum.png",
        "archivo": "curriculum.docx",
        "tipo": "Word"
    },

    {
        "slug": "carta-presentacion",
        "titulo": "Modelo carta de presentación Word",
        "descripcion": "Plantilla profesional para acompañar tu currículum.",
        "preview": "carta_presentacion.png",
        "archivo": "carta_presentacion.docx",
        "tipo": "Word"
    },

    {
        "slug": "carta-renuncia",
        "titulo": "Modelo carta de renuncia Word",
        "descripcion": "Formato editable para presentar una renuncia laboral formal.",
        "preview": "modelo_carta_de_renuncia.png",
        "archivo": "modelo_carta_de_renuncia_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "carta-poder-simple",
        "titulo": "Modelo carta poder simple Word",
        "descripcion": "Plantilla editable de carta poder simple para distintos trámites.",
        "preview": "modelo_carta_poder_simple_word.png",
        "archivo": "modelo_carta_poder_simple_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "constancia-trabajo",
        "titulo": "Modelo constancia de trabajo Word",
        "descripcion": "Formato profesional de constancia laboral editable.",
        "preview": "modelo_constancia_trabajo_word.png",
        "archivo": "modelo_constancia_trabajo_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "contrato-alquiler",
        "titulo": "Modelo contrato alquiler Word",
        "descripcion": "Contrato editable de alquiler listo para personalizar.",
        "preview": "modelo_contrato_alquiler_word.png",
        "archivo": "modelo_contrato_alquiler_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "control-asistencia-excel",
        "titulo": "Modelo control asistencia trabajadores Excel",
        "descripcion": "Plantilla editable para registrar asistencia de trabajadores.",
        "preview": "modelo_control_asistencia_excel.png",
        "archivo": "modelo_control_asistencia_excel.xlsx",
        "tipo": "Excel"
    },

    {
        "slug": "cotizacion-excel",
        "titulo": "Modelo cotización Excel gratis",
        "descripcion": "Formato editable de cotización profesional en Excel.",
        "preview": "modelo_cotizacion_excel.png",
        "archivo": "modelo_cotizacion_excel.xlsx",
        "tipo": "Excel"
    },

    {
        "slug": "inventario-excel",
        "titulo": "Modelo formato inventario Excel",
        "descripcion": "Plantilla editable para control de inventario.",
        "preview": "modelo_formato_inventario_excel.png",
        "archivo": "modelo_formato_inventario_excel.xlsx",
        "tipo": "Excel"
    },

    {
        "slug": "informe-trabajo",
        "titulo": "Modelo informe trabajo Word",
        "descripcion": "Formato profesional para informes laborales y administrativos.",
        "preview": "modelo_informe_trabajo_word.png",
        "archivo": "modelo_informe_trabajo_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "oficio-word",
        "titulo": "Modelo oficio Word",
        "descripcion": "Plantilla editable de oficio formal para distintos trámites.",
        "preview": "modelo_oficio_word.png",
        "archivo": "modelo_oficio_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "planner-semanal",
        "titulo": "Modelo planner semanal Word",
        "descripcion": "Planner semanal editable para organizar tareas y actividades.",
        "preview": "modelo_planner_semanal_word.png",
        "archivo": "modelo_planner_semanal_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "permiso-trabajo",
        "titulo": "Modelo solicitud permiso trabajo Word",
        "descripcion": "Formato editable para solicitar permisos laborales.",
        "preview": "modelo_solicitud_permiso_trabajo_word.png",
        "archivo": "modelo_solicitud_permiso_trabajo_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "acta-reunion",
        "titulo": "Modelo acta reunión Word",
        "descripcion": "Plantilla profesional de acta de reunión editable.",
        "preview": "modelo_acta_reunion_word.png",
        "archivo": "modelo_acta_reunion_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "consentimiento-informado",
        "titulo": "Modelo consentimiento informado Word",
        "descripcion": "Formato editable de consentimiento informado.",
        "preview": "modelo_consentimiento_informado_word.png",
        "archivo": "modelo_consentimiento_informado_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "contrato-trabajo",
        "titulo": "Modelo contrato de trabajo Word",
        "descripcion": "Contrato laboral editable listo para personalizar.",
        "preview": "modelo_contrato_trabajo_word.png",
        "archivo": "modelo_contrato_trabajo_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "declaracion-jurada",
        "titulo": "Modelo declaración jurada simple Word",
        "descripcion": "Plantilla editable de declaración jurada simple.",
        "preview": "modelo_declaracion_jurada_simple_word.png",
        "archivo": "modelo_declaracion_jurada_simple_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "memorandum-word",
        "titulo": "Modelo memorándum Word",
        "descripcion": "Formato editable de memorándum profesional.",
        "preview": "modelo_memorandum_word.png",
        "archivo": "modelo_memorandum_word.docx",
        "tipo": "Word"
    },

    {
        "slug": "solicitud-empleo",
        "titulo": "Modelo solicitud de empleo Word",
        "descripcion": "Plantilla editable para solicitar empleo formalmente.",
        "preview": "modelo_solicitud_empleo_word.png",
        "archivo": "modelo_solicitud_empleo_word.docx",
        "tipo": "Word"
    }

]


# =========================
# 🔥 RUTAS PLANTILLAS
# =========================

@blog_bp.route("/plantillas")
def plantillas_listado():
    return render_template("plantillas/plantillas.html", plantillas=plantillas)


@blog_bp.route("/plantillas/<slug>")
def plantilla_detalle(slug):

    plantilla = next((p for p in plantillas if p["slug"] == slug), None)

    if not plantilla:
        return "No encontrado", 404

    return render_template("plantillas/detalle.html", plantilla=plantilla)

# =========================
# 🔥 RECURSOS
# =========================

@blog_bp.route("/recursos")
def recursos():
    return render_template("recursos/recursos.html")