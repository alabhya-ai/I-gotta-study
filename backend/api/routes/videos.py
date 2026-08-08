from flask import Blueprint, jsonify, request
from sqlalchemy import select, func
from api import db
from api.models.category import Category
from api.models.video import Video
from api.utils.youtube import extract_video_id, fetch_playlist_videos

bp = Blueprint("videos", __name__, url_prefix="/api")


@bp.get("/categories/<int:category_id>/videos")
def list_videos(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    videos = Video.query.filter_by(category_id=category_id).order_by(Video.position).all()
    return jsonify([v.to_dict() for v in videos])


@bp.post("/categories/<int:category_id>/videos")
def add_video(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"error": "url is required"}), 400

    youtube_id = extract_video_id(url)
    if not youtube_id:
        return jsonify({"error": "invalid YouTube URL"}), 400

    title = (data.get("title") or youtube_id).strip()
    thumbnail_url = f"https://img.youtube.com/vi/{youtube_id}/mqdefault.jpg"

    max_pos = db.session.scalar(
        select(func.max(Video.position)).where(Video.category_id == category_id)
    )
    position = 0 if max_pos is None else max_pos + 1

    video = Video(
        category_id=category_id,
        youtube_id=youtube_id,
        title=title,
        thumbnail_url=thumbnail_url,
        position=position,
    )
    db.session.add(video)
    db.session.commit()
    return jsonify(video.to_dict()), 201


@bp.post("/categories/<int:category_id>/videos/import")
def import_playlist(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    playlist_url = (data.get("playlistUrl") or "").strip()
    if not playlist_url:
        return jsonify({"error": "playlistUrl is required"}), 400

    try:
        playlist_videos = fetch_playlist_videos(playlist_url)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "failed to fetch playlist from YouTube"}), 502

    max_pos = db.session.scalar(
        select(func.max(Video.position)).where(Video.category_id == category_id)
    )
    base_position = 0 if max_pos is None else max_pos + 1

    created = []
    for i, item in enumerate(playlist_videos):
        video = Video(
            category_id=category_id,
            youtube_id=item["youtubeId"],
            title=item["title"],
            thumbnail_url=item["thumbnailUrl"],
            position=base_position + i,
        )
        db.session.add(video)
        created.append(video)

    db.session.commit()
    return jsonify([v.to_dict() for v in created]), 201


@bp.patch("/videos/<int:video_id>")
def update_video(video_id: int):
    video = db.session.get(Video, video_id)
    if video is None:
        return jsonify({"error": "video not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    if "notes" in data:
        video.notes = data["notes"]

    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        video.title = title

    db.session.commit()
    return jsonify(video.to_dict())


@bp.delete("/videos/<int:video_id>")
def delete_video(video_id: int):
    video = db.session.get(Video, video_id)
    if video is None:
        return jsonify({"error": "video not found"}), 404

    db.session.delete(video)
    db.session.commit()
    return "", 204


@bp.patch("/categories/<int:category_id>/videos/order")
def reorder_videos(category_id: int):
    if db.session.get(Category, category_id) is None:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON body required"}), 400

    order = data.get("order")
    if not isinstance(order, list):
        return jsonify({"error": "order must be a list of ids"}), 400

    for index, video_id in enumerate(order):
        video = db.session.get(Video, video_id)
        if video is None or video.category_id != category_id:
            return jsonify({"error": f"video {video_id} not found in this category"}), 404
        video.position = index

    db.session.commit()
    return "", 204
