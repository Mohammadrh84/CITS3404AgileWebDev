# Spurdle

Spurdle is a music guessing game where users choose their favourite artists and try to guess a random song using a series of hints. Players receive more points for guessing with fewer hints, and high scores are shown on a leaderboard.

## Group Member Information

| UWA ID   | Name                | GitHub Username |
| -------- | ------------------- | --------------- |
| 24271659 | Nathan Flack        | nathanjstack    |
| 24364632 | Dhruv Bharuth       | BotDurv         |
| 24443565 | Mohammad Haddadpour | Mohammadrh84    |
| 24197094 | Surtaj Singh        | taj-sketch      |

## Running the Project Locally

Follow these steps to run Spurdle on your local machine.

### Prerequisites

Make sure you have the following installed:

- Python 3
- Git
- pip

### 1. Clone the Repository

```bash
git clone https://github.com/Mohammadrh84/Spurdle.git
cd Spurdle
```

### 2. Create and Activate a Virtual Environment

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment on Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run:

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

For macOS/Linux, activate the virtual environment with:

```bash
source .venv/bin/activate
```

### 3. Install Requirements

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 4. Create a `.env` File

Create a file called `.env` in the project root.

Example `.env` file:

```env
SPURDLE_SECRET_KEY=dev-secret-key
SPURDLE_DATABASE_URL=sqlite:///game.db
```

These values are used by the Flask app for local configuration.

### 5. Set Up the Database

Run the database migrations:

```bash
flask --app app db upgrade
```

This creates or updates the local database tables needed by the project.

For normal setup, this is the only database migration command needed.

### 6. Run the Flask App

Start the Flask development server:

```bash
flask --app app run
```

Then open the local address shown in the terminal, usually:

```text
http://127.0.0.1:5000
```

# Running Tests
1. Ensure Google Chrome is installed (as this is the browser the tests will run on)
2. First make sure the test live server is running by entering `python test_run.py` into the terminal (this uses the test server which uses a test database rather than the main game database)
3. In a separate terminal window, while the test server is running, run the tests with `python -m unittest discover tests`
