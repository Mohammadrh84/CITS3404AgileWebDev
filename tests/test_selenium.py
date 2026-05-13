import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from app.config import TestConfig
from app.models import db, User
from app import create_app
from werkzeug.security import generate_password_hash


class TestAuthSelenium(unittest.TestCase):

    def setUp(self):
        # Create test database so users are not stored in the main game database.
        self.app = create_app(TestConfig)

        with self.app.app_context():
            db.drop_all()
            db.create_all()

        self.driver = webdriver.Firefox()
        self.driver.get("http://127.0.0.1:5000")

    def test_signup(self):
        driver = self.driver

        driver.get("http://127.0.0.1:5000/sign_up")

        driver.find_element(By.NAME, "username").send_keys("testuser")
        driver.find_element(By.NAME, "password").send_keys("testuserpw67#")
        driver.find_element(By.NAME, "confirm").send_keys("testuserpw67#")

        driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()

        WebDriverWait(driver, 5).until(
            EC.url_contains("sign_in")
        )

        self.assertIn("sign_in", driver.current_url)

    def signin(self, username, password):
        # Add specified user information to the database to allow login.
        with self.app.app_context():
            user = User(
                username=username,
                password=generate_password_hash(password)
            )

            db.session.add(user)
            db.session.commit()

        driver = self.driver

        driver.get("http://127.0.0.1:5000/sign_in")

        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "password").send_keys(password)

        driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()

        WebDriverWait(driver, 5).until(
            EC.url_contains("select_artists")
        )

    def test_signin(self):
        driver = self.driver

        self.signin("john532", "password67#")
        # after signing in the user should be taken to the select artists page
        self.assertIn("select_artists", driver.current_url)

    def test_select_artist(self):
        driver = self.driver

        self.signin("john532", "password67#")

        # wait to make sure artist search is visible
        search_box = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.ID, "artistSearch"))
        )

        search_box.send_keys("Drake")
        # wait for api to respond to search (may take time)
        artist_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//button[.//p[text()='Drake']]"
            ))
        )
        
        artist_button.click()

        save_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.ID, "saveArtistsButton"))
        )
        # click the save / start game button
        save_button.click()
    
        # ensure we moved over to the main game
        WebDriverWait(driver, 5).until(
            EC.url_contains("main_game")
        )

        self.assertIn("main_game", driver.current_url)

    def tearDown(self):
        self.driver.quit()


if __name__ == "__main__":
    unittest.main()