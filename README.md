# SkillNest

**SkillNest** is a Django-based learning platform that connects **Creators** and **Learners** through interactive communities, real-time chat, and live video calls.
Admins manage and oversee all activities, ensuring a secure and engaging environment.

---

## Overview

SkillNest enables creators to share knowledge through communities, while learners can join these communities to interact, learn, and collaborate.
The platform supports real-time features such as chat and notifications, powered by **Django Channels**, **Redis**, and **Celery**.

---

## Features

### 👩‍🎨 Creator

* Create and manage **learning communities** (e.g., pottery, crochet, baking, painting).
* Post content, share resources, and host live sessions.
* Communicate in real-time with community members.

### 🧑‍🎓 Learner

* Browse and **join communities** of interest.
* Participate in **real-time chat** and **video sessions**.
* Receive notifications for new posts, messages, or events.

### 🛡️ Admin

* Manage users (approve, deactivate, or monitor).
* Oversee communities, posts, and reports.
* Access the **Admin Dashboard** for system analytics and insights.

---

## Tech Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Backend**        | Django 5+, Django REST Framework, Django Channels |
| **Frontend**       | React (Vite) + Redux                              |
| **Database**       | PostgreSQL (SQLite for development)               |
| **Realtime**       | Channels + Redis                                  |
| **Task Queue**     | Celery                                            |
| **Authentication** | JWT (cookie-based), Google OAuth (optional)       |

---

## Project Structure

```
skillnest/
├── backend/               # Django backend project
│   ├── accounts/          # User and authentication logic
│   ├── creator/           # Creator-related logic (communities, chat)
│   ├── skillnest/         # Main Django configuration
│   └── admin/             # Admin management and analytics
└── frontend/              # React frontend (Vite)
```

---

## Setup and Installation

### 1. Prerequisites

Ensure you have the following installed:

* Python **3.11+**
* Node.js **18+**
* Redis (for Channels and Celery)
* Git

---

### 2. Clone the Repository

```bash
git clone https://github.com/Salmathsalam-V/skillnest.git
cd skillnest
```

---

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # On Windows
# source venv/bin/activate   # On Linux/Mac

pip install -r requirements.txt
cp .env.example .env         # Create and configure your environment file

python manage.py migrate
python manage.py runserver
```

---

### 4. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on: [http://localhost:5173](http://localhost:5173)
Backend runs on: [http://localhost:8000](http://localhost:8000)

---

## Running Background Services

### 1. Celery (Task Queue)

Used for:

* Sending email notifications
* Handling background tasks
* Managing WebSocket-related events

Run Celery worker:

```bash
venv\Scripts\celery.exe -A skillnest worker --pool=solo --loglevel=info
```

---

### 2. Redis (Message Broker)

Ensure Redis is running locally:

```bash
redis-server
```

---

### 3. Uvicorn (ASGI Server)

Used for development to run Django Channels (real-time WebSocket support):

```bash
uvicorn skillnest.asgi:application --reload
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory based on `.env.example`.
Below are the commonly used environment variables:

| Variable           | Example                                         | Description                |
| ------------------ | ----------------------------------------------- | -------------------------- |
| `SECRET_KEY`       | `your-django-secret`                            | Django secret key          |
| `DATABASE_URL`     | `postgres://user:pass@localhost:5432/skillnest` | Database connection string |
| `REDIS_URL`        | `redis://127.0.0.1:6379/0`                      | Redis instance URL         |
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com`               | Google OAuth client ID     |
| `DEBUG`            | `True`                                          | Development mode toggle    |

---

## Running Tests

```bash
python manage.py test
```

---

## User Roles Summary

| Role        | Key Abilities                                               |
| ----------- | ----------------------------------------------------------- |
| **Creator** | Create/manage communities, host video calls, moderate chats |
| **Learner** | Join communities, participate in chat and live sessions     |
| **Admin**   | Full control over users, communities, and content           |

---

## Key Functionalities

* **Real-Time Chat:** Built with Django Channels + WebSockets.
* **Notifications:** Handled asynchronously with Celery.
* **Live Video Calls:** Integrated with WebSocket signaling and peer connections.
* **Analytics Dashboard:** Admins can view community and user metrics.

---

## Development Notes

* All tokens are stored securely in cookies using **JWT authentication**.
* Axios is configured with `withCredentials: true` for frontend API requests.
* Redis and Celery must be running for chat and notifications to function properly.

---

## License



