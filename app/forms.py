from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo, Regexp


def normalise_username(value):
    if value is None:
        return value

    return value.strip().lower()


class SignupForm(FlaskForm):
    username = StringField(
        'Username',
        filters=[normalise_username],
        validators=[
            DataRequired(),
            Length(
                min=5,
                max=20,
                message='Username must be between 5 and 20 characters.'
            ),
            Regexp(
                r'^[a-z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores.'
            )
        ]
    )

    password = PasswordField(
        'Password',
        validators=[
            DataRequired(),
            Length(min=6)
        ]
    )

    confirm = PasswordField(
        'Confirm Password',
        validators=[
            DataRequired(),
            EqualTo('password')
        ]
    )

    submit = SubmitField('Sign Up')


class LoginForm(FlaskForm):
    username = StringField(
        'Username',
        filters=[normalise_username],
        validators=[
            DataRequired()
        ]
    )

    password = PasswordField(
        'Password',
        validators=[
            DataRequired()
        ]
    )

    submit = SubmitField('Log In')