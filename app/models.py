from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    games = db.relationship('Game', backref='user', lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    score = db.Column(db.Integer, default=0)
    guesses = db.Column(db.Integer, default=0)
    correct = db.Column(db.Boolean)


class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)

    total_points = db.Column(db.Integer, default=0)
    best_streak = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0)
    games_played = db.Column(db.Integer, default=0)
    avg_hints = db.Column(db.Float, default=0)