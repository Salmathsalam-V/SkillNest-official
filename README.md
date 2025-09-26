# SkillNest

SkillNest is a Django-based web platform that connects **Creators** and **Learners** through interactive communities, real-time chat, and live calls.  
Admins manage the entire system.

---

 Features

### 👩‍🎨 Creator
- Create and manage learning **Communities** (e.g., pottery, crochet, baking, etc.)
- Post content, share resources, and host calls.

### 🧑‍🎓 Learner
- Browse and **join communities** of interest.
- **Real-time chat** within joined communities.
- Join scheduled **video calls** or live sessions.

### 🛡️ Admin
- Manage users (approve, deactivate).
- Oversee communities, content, and reports.
- Access to an **Admin Dashboard** for analytics.

---

## 🛠️ Tech Stack
- **Backend:** Django 5+, Django REST Framework, Channels (WebSockets)
- **Frontend:** React + Vite + Redux (if you’re using the React frontend)
- **Database:** PostgreSQL (or SQLite for development)
- **Realtime:** Django Channels + Redis
- **Authentication:** JWT (with cookie-based tokens, Google OAuth optional)

---

## 📂 Project Structure

skillnest/
├─ backend/ # Django project
│ ├─ accounts/ # User & auth logic
│ ├─ creator/ # creators Communities & chat
│ └─ admin
└─ frontend/ # React app


---

## ⚙️ Setup & Installation

### 1️⃣ Prerequisites
- Python 3.11+
- Node.js 18+ (if using React frontend)
- Redis (for Channels/WebSockets)

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/Salmathsalam-V/skillnest.git
cd skillnest

3️⃣ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # configure DB, Redis, etc.
python manage.py migrate
python manage.py runserver

4️⃣ Frontend Setup (optional if React)
cd ../frontend
npm install
npm run dev


Visit: http://localhost:8000 (backend) or http://localhost:5173 (frontend).


🔑 Environment Variables
Variable	Example	Description
SECRET_KEY	your-django-secret	Django secret key
DATABASE_URL	postgres://user:pass@...	DB connection
REDIS_URL	redis://127.0.0.1:6379/0	Channels backend
GOOGLE_CLIENT_ID	xxxx.apps.googleusercontent…	Google OAuth login

🧪 Running Tests
python manage.py test

👥 User Roles Summary
Role	Key Abilities
Creator	Create/manage communities, host calls, moderate chat
Learner	Join communities, participate in chat & video sessions
Admin	Full control: users, communities, site configuration

🌟 Acknowledgements

Django & Django REST Framework

Redis & Channels

React + Vite

