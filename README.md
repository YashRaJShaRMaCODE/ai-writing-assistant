# AI Writing Assistant

A full-stack web application that allows users to submit text and receive rewritten or summarized content through a REST API.

## Features

* Rewrite text
* Summarize text
* Django REST API backend
* React (Vite) frontend
* REST-based communication between frontend and backend
* Loading state and result display

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* SQLite

### Frontend

* React
* Vite
* Axios

## Project Structure

```text
ai-writing-assistant/
│
├── backend/
├── api/
├── frontend/
├── manage.py
└── db.sqlite3
```

## API Endpoint

### Rewrite / Summarize

```http
POST /api/rewrite/
```

Request Body:

```json
{
  "text": "Your text here",
  "mode": "rewrite"
}
```

or

```json
{
  "text": "Your text here",
  "mode": "summarise"
}
```

Response:

```json
{
  "result": "Generated output"
}
```

## Local Setup

### Clone Repository

```bash
git clone <repository-url>
cd ai-writing-assistant
```

### Backend Setup

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment:

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install django
pip install djangorestframework
pip install django-cors-headers
pip install djangorestframework-simplejwt
```

Run migrations:

```bash
python manage.py migrate
```

Start backend server:

```bash
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Frontend Setup

Move into frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
npm install axios
```

Run development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Environment Variables

Currently no environment variables are required.

If AI integration is added later:

```env
ANTHROPIC_API_KEY=your_api_key
```

## Deployment

### Backend

Render / Railway

### Frontend

Vercel

## Author

Yash Raj Sharma

GitHub: YashRaJShaRMaCODE
