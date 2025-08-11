# Project Information System

This is a full-stack web application designed for an academic environment, allowing students and faculty to manage their profiles, projects, and related academic information.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)

---

## Features

* **User Authentication**: Secure user registration and login for both 'Student' and 'Faculty' roles. New users must verify their email with a One-Time Password (OTP).
* **Profile Management**:
    * **Student Profiles**: Include academic details like USN, department, CGPA, and a list of technologies they are proficient in.
    * **Faculty Profiles**: Include designation, department, and areas of expertise (technologies).
* **Project Repository**:
    * Users can create and manage their own projects with details such as a description, budget, status (e.g., 'Ongoing', 'Completed'), and a link to a GitHub repository.
    * A central repository lists all projects, with options to filter and search by title, technologies, themes, or status.
    * Users can view a list of projects they are a part of, even if they are not the project owner.
* **Search and Discovery**:
    * The application includes directories for all students and faculty, with advanced search and filtering based on name, department, and technologies.
* **Data Visualization**:
    * An analytics dashboard provides insights into projects through various charts, such as the distribution of projects by technology or student involvement in different project themes.

---

## Technologies Used

### Backend

* **Flask**: A lightweight Python web framework for building the API.
* **SQLAlchemy**: An Object-Relational Mapper (ORM) for interacting with the database.
* **MySQL**: The relational database used for data storage.
* **Flask-Bcrypt**: For hashing passwords.
* **Flask-Mail**: For sending OTP emails for verification.

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **Vite**: A fast build tool for modern web development.
* **React Router**: For handling client-side routing.
* **Axios**: For making HTTP requests to the backend API.
* **Recharts**: A charting library for data visualization.
* **Tailwind CSS**: A utility-first CSS framework for styling.

---

## Project Structure

```bash
/
├── Server/
│   ├── app.py              # Main Flask application file with API routes
│   ├── config.py           # Configuration for the Flask app (database, mail, etc.)
│   ├── models.py           # SQLAlchemy database models
│   └── ...
└── Project-management-frontend/
├── public/
├── src/
│   ├── components/     # Reusable UI components
│   ├── assets/         # Static assets like images
│   ├── App.jsx         # Main application component with routing
│   ├── main.jsx        # Entry point for the React application
│   ├── index.css       # Global CSS styles
│   └── ...             # Other React components for different pages
├── package.json        # Frontend dependencies and scripts
└── vite.config.js      # Vite configuration file

```
---

## Setup and Installation

### Prerequisites

* Node.js and npm (or yarn)
* Python 3.x and pip
* MySQL Server

### Backend Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/PoornavG/project_management
    cd project_management/Server
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install dependencies**:
    ```bash
    pip install Flask Flask-SQLAlchemy Flask-Cors Flask-Bcrypt Flask-Mail PyMySQL
    ```

4.  **Configure the database**:
    * Make sure your MySQL server is running.
    * Create a database named `project_management`.
    * Update the `config.py` file with your MySQL credentials (host, user, password) and your Gmail credentials for sending emails.

5.  **Initialize the database**:
    ```bash
    flask --app app initdb
    ```

6.  **Run the Flask server**:
    ```bash
    python app.py
    ```
    The backend will be running at `http://127.0.0.1:8080`.

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../Project-management-frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Vite development server**:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use).

---

## API Endpoints

The backend provides several API endpoints to manage users, projects, and other resources. Here are some of the main ones:

* `POST /signup`: Register a new user.
* `POST /login`: Log in a user.
* `POST /send-otp`: Send a verification OTP to a user's email.
* `POST /verify-otp`: Verify the OTP.
* `GET /projects`: Get a list of all projects.
* `POST /projects`: Add a new project.
* `GET /students`: Get a list of all students.
* `GET /faculty`: Get a list of all faculty members.

For more details, please refer to the `app.py` file.

---

## Usage

1.  **Register**: Create a new account as either a 'Student' or 'Faculty'.
2.  **Verify Email**: Check your email for an OTP and verify your account.
3.  **Complete Profile**: After your first login, you will be prompted to complete your profile details.
4.  **Explore**:
    * Browse the **Project Repository** to see all existing projects.
    * Use the **Student** and **Faculty Directories** to find and connect with others.
    * Check out the **Charts** section for visual insights into the project data.
5.  **Manage Your Work**:
    * If you are a project owner, you can create new projects and edit existing ones from the **My Projects** page.
    * Update your profile at any time from the **My Profile** page.
