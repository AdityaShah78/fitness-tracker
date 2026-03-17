# Fitness Tracker App

A full-stack fitness tracker built with React, Node.js, Express, and PostgreSQL.

## Features

- Create and manage users
- Add and view workouts
- Add and view weight entries
- Delete workouts and weight entries
- Dashboard summary for selected user
- PostgreSQL relational database with foreign keys

## Tech Stack

- Frontend: React
- Backend: Node.js, Express
- Database: PostgreSQL
- API Testing: Hoppscotch

## Project Structure

fitness-tracker/
backend/
frontend/

## How to Run

### Backend

cd backend
npm install
npm run dev

Runs on http://localhost:3001

### Frontend

cd frontend
npm install
npm start

Runs on http://localhost:3000

## API Routes

### Users

- POST /users
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

### Workouts

- POST /workouts
- GET /workouts/:userId
- PUT /workouts/:id
- DELETE /workouts/:id

### Weight Entries

- POST /weights
- GET /weights/:userId
- PUT /weights/:id
- DELETE /weights/:id

## Notes

This project demonstrates full-stack development, REST APIs, and PostgreSQL integration.
