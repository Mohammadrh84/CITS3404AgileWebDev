import unittest
from app import create_app
from app.forms import SignupForm, LoginForm


class TestForms(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        # Disable CSRF for testing purposes.
        self.app.config["WTF_CSRF_ENABLED"] = False

    def test_signup_form(self):
        with self.app.test_request_context():
            # Valid signup: username is at least 5 characters,
            # password has letters, numbers, and a special character.
            valid_form = SignupForm(
                username="testuser",
                password="testpassword67!",
                confirm="testpassword67!"
            )

            self.assertTrue(valid_form.validate())

            # Invalid signup: password is too short.
            bad_password_form = SignupForm(
                username="testuser",
                password="test",
                confirm="test"
            )

            self.assertFalse(bad_password_form.validate())

            # Invalid signup: username is empty.
            empty_username_form = SignupForm(
                username="",
                password="testpassword67!",
                confirm="testpassword67!"
            )

            self.assertFalse(empty_username_form.validate())

            # Invalid signup: password confirmation does not match.
            mismatched_password_form = SignupForm(
                username="testuser",
                password="testpassword67!",
                confirm="differentpassword67!"
            )

            self.assertFalse(mismatched_password_form.validate())

    def test_login_form_valid(self):
        with self.app.test_request_context():
            # Login form only requires both fields to be non-empty.
            valid_form = LoginForm(
                username="user",
                password="testpassword67"
            )

            self.assertTrue(valid_form.validate())

            empty_password_form = LoginForm(
                username="user",
                password=""
            )

            self.assertFalse(empty_password_form.validate())


if __name__ == "__main__":
    unittest.main()