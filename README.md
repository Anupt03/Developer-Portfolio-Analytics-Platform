# DevScope AI

An AI-Powered Developer Portfolio Analytics Platform that helps developers understand their hiring readiness and helps recruiters discover top talent.

## Features

- **GitHub Analytics**: Deep dive into your repository statistics, language usage, and open source contributions.
- **LeetCode Integration**: Track your DSA progress, problem-solving streak, and contest ratings.
- **Resume Analyzer**: Upload your PDF resume for ATS scoring, quality metrics, and improvement tips.
- **AI Career Coach**: Get personalized, actionable insights based on your combined data profile.
- **Recruiter Dashboard**: Allow recruiters to search, filter, and compare candidate profiles securely.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT with Refresh Token Rotation, bcrypt
- **Deployment**: Docker, Docker Compose

## Quick Start (Docker)

The easiest way to run DevScope AI is using Docker Compose:

1. Clone the repository
2. Copy `.env.example` to `.env` in the root and fill in the required variables (especially `GITHUB_TOKEN`)
3. Run `docker-compose up --build -d`
4. Access the frontend at `http://localhost:5173` and the backend API at `http://localhost:5000`

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)
- GitHub Personal Access Token

### Backend Setup

1. `cd server`
2. `npm install`
3. Create `.env` in the `server` directory (copy from `../.env.example`)
4. Create an uploads directory: `mkdir uploads`
5. `npm run dev`

### Frontend Setup

1. `cd client`
2. `npm install`
3. Create `.env` in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. `npm run dev`
