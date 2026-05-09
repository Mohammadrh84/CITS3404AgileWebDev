import os


class Config:
    SECRET_KEY = os.environ.get(
        "SPURDLE_SECRET_KEY",
        "dev-only-secret-key-change-before-production"
    )

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "SPURDLE_DATABASE_URL",
        "sqlite:///game.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False