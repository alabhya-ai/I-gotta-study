from datetime import datetime, timezone
from api import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    videos = db.relationship("Video", backref="category", cascade="all, delete-orphan", lazy=True)
    resources = db.relationship("Resource", backref="category", cascade="all, delete-orphan", lazy=True)
    notes = db.relationship("Note", backref="category", cascade="all, delete-orphan", lazy=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "position": self.position,
            "createdAt": self.created_at.isoformat(),
        }
