from datetime import datetime, timezone
from api import db


class Video(db.Model):
    __tablename__ = "videos"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    youtube_id = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "categoryId": self.category_id,
            "youtubeId": self.youtube_id,
            "title": self.title,
            "thumbnailUrl": self.thumbnail_url,
            "notes": self.notes or "",
            "position": self.position,
            "createdAt": self.created_at.isoformat(),
        }
