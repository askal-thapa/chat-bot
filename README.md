# AI Mind Reset Bot

An AI-powered chatbot designed to help users manage stress and anxiety using Google Gemini, FastAPI, LangGraph, and Next.js.

## Features
-   **Intelligent Routing**: Distinguishes between Small Talk, Therapy support, and Off-topic queries.
-   **Dynamic Mood Theming**: The UI Theme changes colors based on the user's detected mood (Happy, Sad, Angry, Anxious, Neutral).
-   **Premium UI**: Glassmorphism design with shadcn/ui components.

## Prerequisites
-   Python 3.9+
-   Node.js & npm
-   Google Gemini API Key

## Setup & Running

### 1. Backend (FastAPI)

Navigate to the backend folder:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend` directory and add your API key:
```env
GOOGLE_API_KEY=your_actual_api_key_here
```

Run the server:
```bash
uvicorn app.main:app --reload
```
The backend will run at `http://localhost:8000`.

### 2. Frontend (Next.js)

Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The frontend will run at `http://localhost:3000`.

## Usage
1.  Open `http://localhost:3000` in your browser.
2.  Start chatting! The bot will analyze your intent and mood in real-time, and the theme colors will change accordingly.
