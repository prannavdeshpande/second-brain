# Second Brain Backend (Node.js/Express)

This is the main application backend for the Second Brain project. It handles user authentication, content management, and acts as a gateway to the Python-based Machine Learning service for content ingestion and querying.

## Prerequisites

- Node.js (v18 or later)
- npm
- MongoDB
- Python (for the ML service)
- Docker (optional, but recommended for running dependencies)

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd second-brain-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of this project and add the following variables:
    ```ini
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/second_brain_db
    JWT_SECRET=your_super_secret_jwt_key
    ML_API_URL=http://localhost:8000
    ```

4.  **Run the Python ML Service:**
    Navigate to your Python project directory (`main.py`, `ingest.py`, etc.) and start its server, which should be running on the `ML_API_URL` (e.g., `http://localhost:8000`).

## Running the Application

1.  **Start the Node.js server:**
    ```bash
    # For development with auto-reloading
    npm run dev

    # For production
    npm start
    ```

2.  The server will start on the port specified in your `.env` file (e.g., `http://localhost:5001`).

## API Endpoints

-   **Authentication**
    -   `POST /api/auth/register`: Create a new user.
    -   `POST /api/auth/login`: Log in and receive a JWT.

-   **Content Management** (Requires Bearer Token)
    -   `POST /api/content/upload`: Upload a file or URL. Use multipart/form-data.
    -   `GET /api/content`: Get all content for the logged-in user.

-   **Search** (Requires Bearer Token)
    -   `POST /api/search`: Perform a search query against your content.