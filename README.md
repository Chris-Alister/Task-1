# Student Mark Management System

A full-stack application for managing student marks with GraphQL API and React frontend.

## Project Structure

```
├── backend/                    # Backend Server (GraphQL + MongoDB)
│   ├── config/                # Database configuration  
│   ├── controllers/           # REST controllers (legacy - not used)
│   ├── graphql/              # GraphQL schema and resolvers
│   │   ├── typeDefs.js       # GraphQL type definitions
│   │   ├── resolvers.js      # GraphQL resolvers
│   │   └── dateScalar.js     # Custom Date scalar
│   ├── middleware/           # Authentication middleware
│   ├── models/               # MongoDB models (Student, Teacher, Marks)
│   ├── routes/               # REST routes (legacy - not used)
│   ├── scripts/              # Database seeding scripts
│   ├── .env                  # Environment variables
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── frontend/                   # React Frontend
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components (Modals, Forms)
│   │   ├── contexts/         # React contexts (Authentication)
│   │   ├── graphql/          # GraphQL queries and mutations
│   │   │   ├── auth.js       # Authentication queries
│   │   │   ├── students.js   # Student CRUD operations
│   │   │   └── marks.js      # Marks CRUD operations
│   │   └── pages/            # Page components (Login, Dashboards)
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Root package.json for running both servers
└── README.md                 # This file
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Apollo Server** - GraphQL server
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **Apollo Client** - GraphQL client
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **XLSX** - Excel file generation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-mark-management-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   
   Or install individually:
   ```bash
   # Backend dependencies
   npm run install:backend
   
   # Frontend dependencies  
   npm run install:frontend
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example backend/.env
   
   # Update the configuration in backend/.env:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-mark-system
   JWT_SECRET=your-super-secret-jwt-key
   ```

### Running the Application

#### Option 1: Run both servers together
```bash
npm run dev
```

#### Option 2: Run servers separately
```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend  
npm run frontend:dev
```

#### Production
```bash
# Backend
npm run backend:start

# Frontend build
npm run frontend:build
```

## Features

### Admin Dashboard
- ✅ Student Management (Add, Edit, Delete, View)
- ✅ Real-time updates
- ✅ Filter by class and section
- ✅ Student statistics

### Teacher Dashboard
- ✅ Marks Management (Add, Edit, Delete, View)
- ✅ Real-time updates
- ✅ Download individual/combined reports
- ✅ Filter by subject, exam type, academic year
- ✅ Data validation and error handling

## GraphQL API

The application uses GraphQL for all data operations. Key features:
- Type-safe schema
- Real-time cache updates
- Optimistic UI updates
- Comprehensive error handling

## Authentication

- JWT-based authentication
- Role-based access (Admin/Teacher)
- Protected routes and operations

## Development

- Hot module replacement for both frontend and backend
- Apollo Client DevTools support
- Comprehensive error logging
- Production-ready code structure
