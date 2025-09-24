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
git clone https://github.com/<your-username>/skillnest.git
cd skillnest


