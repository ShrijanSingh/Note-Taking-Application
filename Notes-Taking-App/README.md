# FullStack Note-Taking App

## Overview
A full-stack note-taking application with user authentication (email+OTP or Google), JWT authorization, and note management. Built with React (TypeScript, Vite), Node.js (TypeScript, Express), and PostgreSQL.

## Features
- User signup (email+OTP or Google)
- Login (email+OTP or Google)
- JWT-based authentication
- Create, edit, and delete notes
- Dynamic note labeling ("Note 1", "Note 2", etc.)
- Modern, responsive, and visually rich UI
- Welcome section and notes grid fill the page
- Error handling and validation

## Tech Stack
- **Frontend:** ReactJS (TypeScript, Vite)
- **Backend:** Node.js (TypeScript, Express)
- **Database:** PostgreSQL

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL

### Setup

#### 1. Backend
```
cd backend
npm install
# Copy .env.example to .env and fill in:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (any random string)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - OTP_EMAIL_USER (your Gmail address)
# - OTP_EMAIL_PASS (Gmail App Password, not your regular password)
npm run dev
```

#### 2. Frontend
```
cd frontend
npm install
npm run dev
```
# Usage

- On first load, register or login with email/OTP or Google.
- After login, the dashboard shows a welcome card and a grid of notes.
- Each note is labeled ("Note 1", "Note 2", etc.) and can be edited or deleted.
- The UI is fully responsive and fills the page for a modern app experience.

# Screenshots

![Dashboard Screenshot](frontend/public/Dashboard.png)

### Deployment
- Deploy backend and frontend to your preferred cloud provider (e.g., Vercel, Render, Railway, Heroku, etc.)
- Set environment variables as per your cloud provider's instructions.

## License
MIT
