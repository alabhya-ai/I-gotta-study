from flask import Blueprint, jsonify, request
from api import db
from api.models.category import Category
from api.models.note import Note

bp = Blueprint("notes", __name__, url_prefix="/api")


@bp.get("/categories/<int:category_id>/notes")
def list_notes(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    notes = Note.query.filter_by(category_id=category_id).order_by(Note.created_at).all()
    return jsonify([n.to_dict() for n in notes])


@bp.post("/categories/<int:category_id>/notes")
def add_note(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "content is required"}), 400

    title = (data.get("title") or "").strip() or None
    linked_video_id = data.get("linkedVideoId") or None
    linked_resource_id = data.get("linkedResourceId") or None

    note = Note(
        category_id=category_id,
        title=title,
        content=content,
        linked_video_id=linked_video_id,
        linked_resource_id=linked_resource_id,
    )
    db.session.add(note)
    db.session.commit()
    return jsonify(note.to_dict()), 201


@bp.patch("/notes/<int:note_id>")
def update_note(note_id: int):
    note = db.session.get(Note, note_id)
    if note is None:
        return jsonify({"error": "note not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    if "content" in data:
        content = (data["content"] or "").strip()
        if not content:
            return jsonify({"error": "content cannot be empty"}), 400
        note.content = content

    if "title" in data:
        note.title = (data["title"] or "").strip() or None

    db.session.commit()
    return jsonify(note.to_dict())


@bp.delete("/notes/<int:note_id>")
def delete_note(note_id: int):
    note = db.session.get(Note, note_id)
    if note is None:
        return jsonify({"error": "note not found"}), 404

    db.session.delete(note)
    db.session.commit()
    return "", 204
