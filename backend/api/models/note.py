from datetime import datetime, timezone
from api import db


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    title = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=False)
    linked_video_id = db.Column(db.Integer, db.ForeignKey("videos.id"), nullable=True)
    linked_resource_id = db.Column(db.Integer, db.ForeignKey("resources.id"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "categoryId": self.category_id,
            "title": self.title,
            "content": self.content,
            "linkedVideoId": self.linked_video_id,
            "linkedResourceId": self.linked_resource_id,
            "createdAt": self.created_at.isoformat(),
        }
