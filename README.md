# UrbanEase — Verified Home Services Platform

A full-stack MERN application combining a **Home Services Platform (UrbanEase)** with a **Team Members Management System (CT2 Implementation)**.

---

## Project Overview

### UrbanEase (Main Project)
Connects users with verified home service providers (electricians, plumbers, etc.)

- JWT Authentication with Role-Based Access (User / Provider / Admin)
- Provider verification via Admin approval
- Booking system with Reviews & Ratings
- Admin Dashboard

### Team Management System (CT2)
A module to manage team members built with React + Node.js.

- Add member with image upload
- View all members / individual member details
- Navbar navigation (Team 13 UI)

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, Axios     |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| Other      | Multer (image upload), JWT        |

---

## Project Structure

```
client/       → React Frontend
server/       → Node + Express Backend
uploads/      → Stored images
.gitignore
README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/shubhxydv/Team---13-.git
cd Team---13
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Setup environment variables

Create a `.env` file inside `server/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Run the Application

```bash
# Start backend
cd server
npm start

# Start frontend (new terminal)
cd client
npm run dev
```

---

## API Endpoints

### Team Members (CT2)

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | `/api/members`      | Add new member (+ image) |
| GET    | `/api/members`      | Fetch all members        |
| GET    | `/api/members/:id`  | Fetch single member      |

---

## Team 13

- Harsh Kumar
- Vansh Shah
- Shubhankur
