# FullStack Note-Taking App

## Overview
A full-stack note-taking application with user authentication (email+OTP or Google), JWT authorization, and note management. Built with React (TypeScript, Vite), Node.js (TypeScript, Express), and PostgreSQL.

## Features
- User signup (email+OTP or Google)
- Login (email+OTP or Google)
- JWT-based authentication
- Create and delete notes
- Responsive, mobile-friendly UI
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
cp .env.example .env # Edit .env with your DB and JWT config
npm run dev
```

#### 2. Frontend
```
npm install
npm run dev
```

### Deployment
- Deploy backend and frontend to your preferred cloud provider (e.g., Vercel, Render, Railway, Heroku, etc.)
- Set environment variables as per your cloud provider's instructions.

## License
MIT
