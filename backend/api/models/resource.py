from datetime import datetime, timezone
from api import db

RESOURCE_TYPE_URL = "url"
RESOURCE_TYPE_FILE = "file"
VALID_RESOURCE_TYPES = {RESOURCE_TYPE_URL, RESOURCE_TYPE_FILE}


class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(2000), nullable=False)
    resource_type = db.Column(db.String(10), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "categoryId": self.category_id,
            "title": self.title,
            "url": self.url,
            "resourceType": self.resource_type,
            "position": self.position,
            "createdAt": self.created_at.isoformat(),
        }
