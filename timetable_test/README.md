# Timetable App - Course Management System

A comprehensive web application for managing academic timetables with user authentication, role-based permissions, and conflict detection.

## 🚀 Features

### Phase 1: MVP (Essential Features)

#### Core Timetable Management
- **Flexible Schedule Creation**: Year/trimester selection with dropdown controls
- **Course Management**: Add, edit, and delete courses with name, teacher, room, and time
- **Intuitive Interface**: Clean grid-based timetable view with responsive design
- **Quick Editing**: Inline editing capabilities with auto-save functionality
- **Conflict Detection**: Automatic detection of teacher and room double-booking

#### Data Management & Collaboration
- **Persistent Data Storage**: SQLite database with auto-save and data persistence
- **User Authentication**: JWT-based login system with secure password hashing
- **Role-Based Permissions**: Admin, editor, and read-only user roles
- **Import/Update Feature**: Bulk import lecturers and courses via CSV files with validation and conflict detection

#### Reporting & Exporting
- **Printable Views**: Clean print layout optimized for current timetable
- **Export Functionality**: PDF and CSV export capabilities (framework ready)
- **CSV Import Templates**: Download template files for proper formatting

### Phase 2: Important Enhancements (Planned)
- Advanced filters (teacher, room, course)
- Enhanced conflict alerts with suggestions
- Real-time collaboration
- Change tracking and edit history
- Export filtered views
- Excel/spreadsheet format support

### Phase 3: Advanced Features (Planned)
- Drag-and-drop interface
- Backup and restore options
- Single sign-on (SSO) integration
- Automated scheduling algorithms
- Notifications and alerts
- Mobile-friendly version

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Build Tool**: Vite for fast development
- **Backend**: Node.js with Express
- **Database**: SQLite with proper relationships and constraints
- **Authentication**: JWT-based with bcrypt password hashing
- **Export Libraries**: jsPDF and PapaParse (ready for implementation)

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn package manager

## 🚀 Installation

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timetable-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start frontend development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

## 🔐 Demo Accounts

The application comes with three demo accounts for testing different permission levels:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | Admin | Full access (create, edit, delete, view) |
| `editor` | `editor123` | Editor | Create, edit, view (no admin functions) |
| `viewer` | `viewer123` | Read-only | View only (no modifications) |

## 🗄️ Database Architecture

The application uses SQLite with the following structure:

- **Users**: Authentication and role management
- **Teachers**: Faculty information and course assignments  
- **Rooms**: Classroom details and capacity
- **Courses**: Scheduled classes with time, location, and instructor
- **Automatic Conflict Detection**: Prevents double-booking of teachers and rooms

## 🎯 Usage Guide

### Getting Started
1. **Login**: Use one of the demo accounts above
2. **Dashboard**: View overview statistics and quick actions
3. **Timetable**: Navigate to see the current schedule grid
4. **Add Courses**: Use the "Add Course" button to create new entries

### Managing Courses
- **Add Course**: Fill in course details including teacher, room, day, and time
- **Edit Course**: Click the edit button on any course card for inline editing
- **Delete Course**: Remove courses (only available to admin/editor roles)
- **Conflict Detection**: The system automatically detects and highlights scheduling conflicts

### Managing Teachers & Rooms
- **Teachers**: Add faculty members with departments
- **Rooms**: Create classrooms with building and capacity information
- **Safety Checks**: Cannot delete teachers/rooms that have assigned courses

### Reports & Export
- **Filters**: Filter data by teacher, room, or day
- **Print View**: Clean, print-optimized layout
- **Export Options**: PDF and CSV export (ready for implementation)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── Login.jsx       # Authentication component
│   ├── Dashboard.jsx   # Overview dashboard
│   ├── TimetableView.jsx # Main timetable grid
│   ├── CourseManagement.jsx # Course CRUD operations
│   ├── TeacherManagement.jsx # Teacher management
│   ├── RoomManagement.jsx # Room management
│   ├── Reports.jsx     # Export and reporting
│   ├── CourseCard.jsx  # Individual course display
│   ├── AddCourseModal.jsx # Course creation modal
│   └── LoadingSpinner.jsx # Loading states
├── contexts/           # React contexts
│   ├── AuthContext.jsx # User authentication & permissions
│   └── TimetableContext.jsx # Timetable data management
├── main.jsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🎨 Customization

### Styling
- **Colors**: Modify `tailwind.config.js` for custom color schemes
- **Components**: Update `src/index.css` for component-specific styles
- **Layout**: Adjust `src/components/Layout.jsx` for navigation changes

### Data Structure
- **Sample Data**: Initial teachers and rooms are defined in `TimetableContext.jsx`
- **Time Slots**: Modify the time slots array in `TimetableView.jsx`
- **Days**: Update the days array for different academic schedules

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Traditional Hosting**: Upload `dist/` folder to web server
- **Container**: Dockerize with nginx for production

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Quality
- ESLint configuration included
- Prettier formatting recommended
- Component-based architecture
- Consistent naming conventions

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Change port in `vite.config.js`
2. **Build errors**: Clear `node_modules` and reinstall
3. **Styling issues**: Ensure Tailwind CSS is properly imported

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Print-friendly layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React and modern web technologies**
