from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    # connect each user to all their game records
    games = db.relationship('Game', backref='user', lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    guesses = db.Column(db.Integer, default=0)
    correct = db.Column(db.Boolean) # whether they correctly guessed the song in that game


class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    total_points = db.Column(db.Integer, default=0) # add to this value after each game
    accuracy = db.Column(db.Float, default=0)
    games_played = db.Column(db.Integer, default=0) # increment by 1 for each game record
    avg_hints = db.Column(db.Float, default=0)