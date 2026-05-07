from flask import Blueprint, render_template

tools_bp = Blueprint('tools', __name__)

@tools_bp.route("/compress")
def compress():
    return render_template("tools/compress.html")

@tools_bp.route("/split")
def split():
    return render_template("tools/split.html")

@tools_bp.route("/order")
def order():
    return render_template("tools/order.html")

@tools_bp.route("/sign")
def sign():
    return render_template("tools/sign.html")