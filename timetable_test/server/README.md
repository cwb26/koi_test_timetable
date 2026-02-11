# Timetable App Backend Server

This is the backend API server for the Timetable App, built with Node.js, Express, and SQLite.

## Features

- **Authentication**: JWT-based authentication with role-based permissions
- **Database**: SQLite database with proper relationships and constraints
- **API Endpoints**: RESTful API for all timetable operations
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Data Validation**: Input validation and sanitization
- **Security**: Password hashing, JWT tokens, and CORS support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The server will start on port 5000 by default.

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password_hash`: Hashed password
- `role`: User role (admin, editor, readonly)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Teachers Table
- `id`: Primary key
- `name`: Teacher's full name
- `department`: Department name
- `email`: Email address
- `phone`: Phone number
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Rooms Table
- `id`: Primary key
- `name`: Room name/identifier
- `building`: Building name
- `capacity`: Room capacity
- `room_type`: Type of room (e.g., Lecture Hall, Lab)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Courses Table
- `id`: Primary key
- `name`: Course name
- `teacher_id`: Foreign key to teachers table
- `room_id`: Foreign key to rooms table
- `day`: Day of the week
- `start_time`: Start time (HH:MM format)
- `end_time`: End time (HH:MM format)
- `year`: Academic year
- `trimester`: Academic trimester
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Courses
- `GET /api/courses` - Get all courses (with optional filters)
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create a new teacher
- `PUT /api/teachers/:id` - Update a teacher
- `DELETE /api/teachers/:id` - Delete a teacher

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a new room
- `PUT /api/rooms/:id` - Update a room
- `DELETE /api/rooms/:id` - Delete a room

### Conflicts
- `GET /api/conflicts` - Get scheduling conflicts for a year/trimester

### Statistics
- `GET /api/stats` - Get system statistics

## Default Users

The database is initialized with these default users:

- **admin** / admin123 (admin role)
- **editor** / editor123 (editor role)
- **viewer** / viewer123 (readonly role)

## Environment Variables

- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens (default: 'your-secret-key-change-in-production')

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize/reset database

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## Error Handling

The API returns consistent error responses:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (database/server errors)

## Conflict Detection

The system automatically detects:
- Teacher double-booking (same teacher at same time)
- Room double-booking (same room at same time)
- Time slot overlaps

Conflicts are prevented during course creation/updates and can be queried via the conflicts endpoint.

