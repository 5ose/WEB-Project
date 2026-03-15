# WEB Project – MERN Stack Video Platform

This repository contains the implementation of the **WEB Project**, a full-stack application built using the **MERN Stack (MongoDB, Express, React/Next.js, Node.js)** with additional technologies such as **MinIO, Docker, ffmpeg, and Nodemailer**.

The system allows users to **upload short videos, interact with content, follow other users, leave reviews, and receive notifications**, while administrators have moderation and analytics capabilities.

---

# Repository Structure

```
WEB-Project
├─ .gitignore
├─ docker-compose.yml
├─ README.md
├─ backend
│  ├─ .env
│  ├─ app.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ server.js
│  ├─ bruno
│  │  ├─ bruno.json
│  │  ├─ collection.bru
│  │  ├─ getfollwoing.bru
│  │  ├─ Notfication Prefences in main and app.bru
│  │  ├─ TestingIfalreadfollow.bru
│  │  ├─ Unfollow.bru
│  │  ├─ user can not follow himself.bru
│  │  ├─ UserAsignin.bru
│  │  ├─ environments
│  │  │  └─ Dev.bru
│  │  └─ Testing
│  │     ├─ folder.bru
│  │     └─ Sign up.bru
│  ├─ config
│  │  └─ db.js
│  ├─ controllers
│  │  ├─ authController.js
│  │  ├─ healthController.js
│  │  ├─ reviewController.js
│  │  ├─ userController.js
│  │  └─ videoController.js
│  ├─ middleware
│  │  ├─ authMiddleware.js
│  │  ├─ errorMiddleware.js
│  │  ├─ ownershipMiddleware.js
│  │  └─ validateMiddleware.js
│  ├─ models
│  │  ├─ emailQueueModel.js
│  │  ├─ followModel.js
│  │  ├─ notificationModel.js
│  │  ├─ reviewModel.js
│  │  ├─ userModel.js
│  │  └─ videoModel.js
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  ├─ healthRoutes.js
│  │  ├─ userRoutes.js
│  │  └─ videoRoutes.js
│  ├─ scripts
│  │  └─ testModels.js
│  ├─ services
│  │  ├─ authService.js
│  │  ├─ healthService.js
│  │  ├─ notificationService.js
│  │  ├─ reviewService.js
│  │  ├─ userService.js
│  │  └─ videoServices.js
│  └─ utils
│     ├─ appError.js
│     ├─ catchAsync.js
│     └─ validators.js
└─ frontend
   ├─ .gitignore
   ├─ eslint.config.mjs
   ├─ jsconfig.json
   ├─ next.config.mjs
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.mjs
   ├─ README.md
   ├─ app
   │  ├─ favicon.ico
   │  ├─ globals.css
   │  ├─ layout.js
   │  └─ page.js
   └─ public
      ├─ file.svg
      ├─ globe.svg
      ├─ next.svg
      ├─ vercel.svg
      └─ window.svg
```

---

# Prerequisites

Before running the project, ensure the following are installed:

- **Node.js** (v18+ recommended)
- **npm**
- **MongoDB**
- **Docker Desktop**
- **Git**
- **ffmpeg**

Check installations:

```bash
node -v
npm -v
docker -v
ffmpeg -version
````

---

# Clone the Repository

```bash
git clone <repo-url>
cd WEB-Project
```

---

# Backend Setup (Express + MongoDB)

Navigate to backend:

```bash
cd backend
```

Initialize dependencies:

```bash
npm install
```

If dependencies are missing, install manually:

```bash
npm install express mongoose dotenv cors helmet morgan jsonwebtoken bcryptjs zod multer fluent-ffmpeg nodemailer swagger-jsdoc swagger-ui-express express-mongo-sanitize @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Install development dependency:

```bash
npm install -D nodemon
```

---

# Backend Environment Variables

Create a `.env` file inside **backend/**

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/webproject
JWT_SECRET=supersecret

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

# Start Backend Server

```bash
npm run dev
```

Server will run on:

```
http://localhost:5000
```

Health check:

```
GET /health
```

---

# Frontend Setup (Next.js + Tailwind)

Navigate to frontend:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Install additional packages if missing:

```bash
npm install axios react-player react-icons
```

---

# Frontend Environment Variables

Create `.env.local` inside **frontend/**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

# Start Frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# MinIO Local Object Storage Setup

This project uses **MinIO** to simulate cloud object storage.

Run MinIO using Docker:

```bash
docker compose up -d
```

MinIO Console:

```
http://localhost:9001
```

Default credentials:

```
username: minioadmin
password: minioadmin
```

Create a bucket for videos inside the console.

---

# Media Processing Requirements

The backend validates uploaded videos using **ffmpeg**.

Video rules:

* Maximum duration: **300 seconds (5 minutes)**
* Allowed formats: **video/mp4**
* Validation happens before upload is stored.

---

# API Documentation

Swagger API documentation is available at:

```
http://localhost:5000/api-docs
```

---

# Running the Full System

Start services in this order:

### 1️⃣ Start MongoDB

```bash
mongod
```

### 2️⃣ Start MinIO

```bash
docker compose up -d
```

### 3️⃣ Start Backend

```bash
cd backend
npm run dev
```

### 4️⃣ Start Frontend

```bash
cd frontend
npm run dev
```

---

# Main Features

### Authentication

* User registration
* Login with JWT
* Profile management

### Video System

* Upload short videos
* Video duration validation
* Responsive video player

### Social Features

* Follow / unfollow users
* Leave reviews and ratings
* Like and comment interactions

### Notifications

* Email alerts
* User notification preferences

### Admin System

* Platform statistics
* Moderation tools
* System health monitoring

---

# Development Guidelines

* Follow **Clean Architecture**:
  Routes → Controllers → Services

* Use **Zod validation** for request bodies.

* All protected routes require **JWT authentication**.

* Ownership middleware must validate user actions.

---

# Testing

API endpoints can be tested using:

* **Postman**
* **Swagger UI**

Postman collections are stored in:

```
docs/
```

---

# Phase Implementation

### Phase 1

Backend infrastructure and API system.

### Phase 2

Next.js frontend and media pipeline.

### Phase 3

Real-time notifications and monetization.

### Phase 4

Deployment and system optimization.

---

# Troubleshooting

### npm ENOSPC error

Clear npm cache:

```bash
npm cache clean --force
```

### Port already in use

Kill the process:

```bash
npx kill-port 5000
```

### MongoDB connection failure

Ensure MongoDB service is running.

---

# Contributors

Project developed as part of the **Web Development course**.

---

# License

This project is for **educational purposes**.

```
```

