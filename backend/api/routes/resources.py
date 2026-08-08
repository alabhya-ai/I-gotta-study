from flask import Blueprint, jsonify, request
from sqlalchemy import select, func
from api import db
from api.models.category import Category
from api.models.resource import Resource, VALID_RESOURCE_TYPES

bp = Blueprint("resources", __name__, url_prefix="/api")


@bp.get("/categories/<int:category_id>/resources")
def list_resources(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    resources = Resource.query.filter_by(category_id=category_id).order_by(Resource.position).all()
    return jsonify([r.to_dict() for r in resources])


@bp.post("/categories/<int:category_id>/resources")
def add_resource(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    title = (data.get("title") or "").strip()
    url = (data.get("url") or "").strip()
    resource_type = (data.get("resourceType") or "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400
    if not url:
        return jsonify({"error": "url is required"}), 400
    if resource_type not in VALID_RESOURCE_TYPES:
        return jsonify({"error": f"resourceType must be one of: {', '.join(VALID_RESOURCE_TYPES)}"}), 400

    max_pos = db.session.scalar(
        select(func.max(Resource.position)).where(Resource.category_id == category_id)
    )
    position = 0 if max_pos is None else max_pos + 1

    resource = Resource(
        category_id=category_id,
        title=title,
        url=url,
        resource_type=resource_type,
        position=position,
    )
    db.session.add(resource)
    db.session.commit()
    return jsonify(resource.to_dict()), 201


@bp.patch("/resources/<int:resource_id>")
def update_resource(resource_id: int):
    resource = db.session.get(Resource, resource_id)
    if resource is None:
        return jsonify({"error": "resource not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        resource.title = title

    if "url" in data:
        url = (data["url"] or "").strip()
        if not url:
            return jsonify({"error": "url cannot be empty"}), 400
        resource.url = url

    db.session.commit()
    return jsonify(resource.to_dict())


@bp.delete("/resources/<int:resource_id>")
def delete_resource(resource_id: int):
    resource = db.session.get(Resource, resource_id)
    if resource is None:
        return jsonify({"error": "resource not found"}), 404

    db.session.delete(resource)
    db.session.commit()
    return "", 204


@bp.patch("/categories/<int:category_id>/resources/order")
def reorder_resources(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    order = data.get("order")
    if not isinstance(order, list):
        return jsonify({"error": "order must be a list of ids"}), 400

    for index, resource_id in enumerate(order):
        resource = db.session.get(Resource, resource_id)
        if resource is None or resource.category_id != category_id:
            return jsonify({"error": f"resource {resource_id} not found in this category"}), 404
        resource.position = index

    db.session.commit()
    return "", 204
