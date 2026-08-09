import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__ + "/.."))


def _resolve_sqlite_url(url: str) -> str:
    """Make a relative sqlite:/// path absolute, anchored to the backend directory."""
    prefix = "sqlite:///"
    absolute_prefix = "sqlite:////"
    if not url.startswith(prefix) or url.startswith(absolute_prefix):
        return url
    path = url[len(prefix):]
    if os.path.isabs(path):
        return url
    abs_path = os.path.join(_BACKEND_DIR, path)
    parent = os.path.dirname(abs_path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    return f"{prefix}{abs_path}"


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = _resolve_sqlite_url(
            app.config["SQLALCHEMY_DATABASE_URI"]
        )

    db.init_app(app)
    CORS(app)

    from api.routes.categories import bp as categories_bp
    from api.routes.videos import bp as videos_bp
    from api.routes.resources import bp as resources_bp

    app.register_blueprint(categories_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(resources_bp)

    @app.cli.command("init-db")
    def init_db() -> None:
        db.create_all()
        print("Database initialized.")

    return app
