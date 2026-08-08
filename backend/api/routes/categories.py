from flask import Blueprint, jsonify, request
from sqlalchemy import select, func
from api import db
from api.models.category import Category

bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@bp.get("/")
def list_categories():
    categories = Category.query.order_by(Category.position).all()
    return jsonify([c.to_dict() for c in categories])


@bp.post("/")
def create_category():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    max_pos = db.session.scalar(select(func.max(Category.position)))
    position = 0 if max_pos is None else max_pos + 1

    category = Category(name=name, position=position)
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@bp.patch("/<int:category_id>")
def update_category(category_id: int):
    category = db.session.get(Category, category_id)
    if category is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    category.name = name
    db.session.commit()
    return jsonify(category.to_dict())


@bp.delete("/<int:category_id>")
def delete_category(category_id: int):
    category = db.session.get(Category, category_id)
    if category is None:
        return jsonify({"error": "category not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return "", 204


@bp.patch("/order")
def reorder_categories():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    order = data.get("order")
    if not isinstance(order, list):
        return jsonify({"error": "order must be a list of ids"}), 400

    for index, category_id in enumerate(order):
        category = db.session.get(Category, category_id)
        if category is None:
            return jsonify({"error": f"category {category_id} not found"}), 404
        category.position = index

    db.session.commit()
    return "", 204
