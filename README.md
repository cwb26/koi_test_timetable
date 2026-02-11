# Koi Timetable Management System

A comprehensive web-based timetable management system for educational institutions with user authentication, role-based permissions, and conflict detection.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Features

### Core Functionality
- **Dynamic Timetable Management**: Create, edit, and delete courses with intuitive interface
- **Academic Year Management**: Database-driven year configuration (admin only)
- **Conflict Detection**: Automatic detection of teacher and room scheduling conflicts
- **Role-Based Access Control**: Admin, Editor, and Read-only user roles
- **Real-time Updates**: Instant UI updates with Vite HMR

### User Management
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Permission System**: Granular control over user capabilities

### Data Management
- **CSV Import/Export**: Bulk import teachers and courses
- **Template Downloads**: Pre-formatted CSV templates
- **Data Validation**: Server-side validation with express-validator
- **SQLite Database**: Lightweight, file-based database

### Reporting
- **Printable Views**: Clean, print-optimized layouts
- **Export Capabilities**: PDF and CSV export (framework ready)
- **Conflict Reports**: Detailed conflict detection and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cwb26/koi-timetable.git
   cd koi-timetable/timetable_test
   ```

2. **Install dependencies**
   
   Backend:
   ```bash
   cd server
   npm install
   ```
   
   Frontend:
   ```bash
   cd ..
   npm install
   ```

3. **Initialize the database**
   ```bash
   cd server
   npm run init-db
   ```

4. **Start the servers**
   
   Backend (Terminal 1):
   ```bash
   cd server
   npm start
   ```
   
   Frontend (Terminal 2):
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Windows Quick Start
```bash
# From the root directory
start_servers.bat
```

## 🔐 Default Credentials

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Admin | `admin` | `admin123` | Full access (create, edit, delete, manage years) |
| Editor | `editor` | `editor123` | Create, edit, view (no admin functions) |
| Viewer | `viewer` | `viewer123` | View only (no modifications) |

**⚠️ Important**: Change these credentials in production!

## 📁 Project Structure

```
koi-timetable/
├── timetable_test/
│   ├── server/                 # Backend (Node.js + Express)
│   │   ├── server.js          # Main server file
│   │   ├── init-db.js         # Database initialization
│   │   ├── package.json       # Backend dependencies
│   │   └── timetable.db       # SQLite database (auto-generated)
│   │
│   ├── src/                   # Frontend (React)
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts (Auth, Timetable)
│   │   ├── services/          # API service layer
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   │
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
│
├── start_servers.bat         # Windows batch file to start both servers
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling
- **csv-parser** - CSV processing

## 📖 Usage Guide

### Managing Academic Years (Admin Only)

1. Login as admin
2. Go to Dashboard
3. Scroll to "Academic Years" section
4. Add new years as needed
5. Years appear in all dropdowns automatically

### Creating Courses

1. Navigate to Timetable View or Course Management
2. Click "Add Course"
3. Fill in course details:
   - Course name
   - Teacher
   - Room
   - Day and time
   - Year and trimester
4. Submit to create

### Importing Data

1. Go to Import/Export page
2. Download CSV template
3. Fill in your data
4. Upload the CSV file
5. Review import results

### Generating Reports

1. Navigate to Reports & Export
2. Select year and trimester
3. Apply filters if needed
4. Choose export format (PDF/CSV)
5. Click Export

## 🔧 Configuration

### Environment Variables

Create `.env` files for configuration:

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Database Management

**Initialize/Reset Database:**
```bash
cd server
npm run init-db
```

**Check Academic Years:**
```bash
cd server
node check-years.js
```

## 🧪 Testing

### Test Accounts
Use the default credentials listed above to test different permission levels.

### Test Scenarios
1. Create courses with different teachers and rooms
2. Test conflict detection (same room, same time)
3. Import teachers and courses via CSV
4. Generate reports for different years/trimesters
5. Test role-based permissions

## 🚢 Deployment

### Production Build

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
# Set NODE_ENV=production in your hosting environment
node server.js
```

### Deployment Options
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Full Stack**: Docker container with nginx

### Important for Production
1. Change default user passwords
2. Set strong JWT_SECRET
3. Configure CORS properly
4. Use environment variables
5. Enable HTTPS
6. Set up database backups

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Academic Years
- `GET /api/academic-years` - List all years
- `POST /api/academic-years` - Add new year (admin)
- `DELETE /api/academic-years/:year` - Delete year (admin)

### Courses
- `GET /api/courses` - List courses (with filters)
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Teachers
- `GET /api/teachers` - List teachers
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Import/Export
- `POST /api/import/teachers` - Import teachers CSV
- `POST /api/import/courses` - Import courses CSV
- `GET /api/import/teachers/template` - Download teacher template
- `GET /api/import/courses/template` - Download course template

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- PDF export functionality is framework-ready but not fully implemented
- CSV export needs additional formatting options
- Mobile responsiveness can be improved

## 🗺️ Roadmap

### Phase 2 (Planned)
- [ ] Advanced filters (teacher, room, course)
- [ ] Enhanced conflict alerts with suggestions
- [ ] Real-time collaboration
- [ ] Change tracking and edit history
- [ ] Export filtered views
- [ ] Excel/spreadsheet format support

### Phase 3 (Future)
- [ ] Drag-and-drop interface
- [ ] Backup and restore options
- [ ] Single sign-on (SSO) integration
- [ ] Automated scheduling algorithms
- [ ] Email notifications
- [ ] Mobile app

## 💬 Support

For support, please:
- Create an issue in the repository
- Check existing documentation
- Review the code comments

## 👨‍💻 Author

**cwb26**
- GitHub: [@cwb26](https://github.com/cwb26)

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Inspired by educational institution needs
- Community feedback and contributions

---

**Made with ❤️ for educational institutions**
