# GatePrep - Complete Setup & Running Guide

## 🎯 Project Overview

**GatePrep** is a production-grade, full-fledged web platform for GATE Computer Science & Engineering (CSE) preparation. It features:

- **Secure Authentication** with JWT and role-based access control
- **Practice Mode** with instant feedback and question filtering
- **Proctored Test Mode** with strict exam integrity enforcement
- **Admin Dashboard** for complete question and user management
- **Advanced Analytics** with detailed performance metrics
- **120+ High-Quality Questions** across 12 GATE CSE subjects

## 📊 Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (local or Atlas)
- **Security**: Helmet, CORS, Rate Limiting, JWT, bcryptjs
- **Validation**: Joi, Express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP**: Axios
- **Notifications**: React Hot Toast

## 🚀 Quick Start Guide

### Step 1: Prerequisites

Before starting, ensure you have installed:
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local MongoDB instance running on `localhost:27017`, OR
  - MongoDB Atlas free account (cloud-based)
- **Git** (optional)

Verify installations:
```bash
node --version
npm --version
# For local MongoDB: mongo --version
```

### Step 2: Clone/Setup Project

Navigate to the project directory:
```bash
cd c:\Users\Admin\Videos\gprepp
```

### Step 3: Backend Setup

#### 3.1 Navigate to Backend Directory
```bash
cd backend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Create .env File
```bash
# Copy the example
cp .env.example .env

# Edit .env with your settings
```

#### 3.4 Configure .env File
Edit `backend/.env` with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gateprep
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gateprep

NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# Session Configuration
COOKIE_EXPIRE=7
```

⚠️ **Important**: Change `JWT_SECRET` to a strong, unique value for production!

#### 3.5 Seed Database (Create Initial Data)
This command creates 120 questions and 2 test users:

```bash
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
✅ Created subject: Engineering Mathematics
...
📊 Total questions created: 120
```

#### 3.6 Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ Server is running on port 5000
🌐 Frontend URL: http://localhost:5173
📦 Environment: development
```

**Backend is now running at: http://localhost:5000**

Keep this terminal open and open a NEW terminal for the frontend.

### Step 4: Frontend Setup

#### 4.1 Navigate to Frontend Directory (in a NEW terminal)
```bash
cd c:\Users\Admin\Videos\gprepp\frontend
```

#### 4.2 Install Dependencies
```bash
npm install
```

#### 4.3 Start Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
```

**Frontend is now running at: http://localhost:5173**

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Step 6: Login with Test Credentials

After seeding, two test accounts are created:

#### Admin Account
- **Email**: admin@gateprep.com
- **Password**: Admin@123
- **URL**: http://localhost:5173/login

#### Student Account
- **Email**: student@gateprep.com  
- **Password**: Student@123
- **URL**: http://localhost:5173/login

## 📁 Project Structure

```
gateprep/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── config/database.js        # MongoDB connection
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.js     # Login, Register, Auth
│   │   │   ├── questionController.js # Q&A CRUD
│   │   │   ├── adminController.js    # Admin functions
│   │   │   └── testController.js     # Test & Proctoring
│   │   ├── middlewares/auth.js       # JWT, RBAC, Error handling
│   │   ├── models/                   # Mongoose schemas
│   │   ├── routes/                   # API endpoints
│   │   ├── utils/seed.js             # Database seeding (120 questions)
│   │   ├── validators/schemas.js     # Request validation
│   │   ├── app.js                    # Express app
│   │   └── index.js                  # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env                          # (Create this)
│
├── frontend/                         # React/Vite frontend
│   ├── src/
│   │   ├── pages/                    # React pages
│   │   │   ├── AuthPages.jsx         # Login, Register
│   │   │   ├── StudentDashboard.jsx  # Student home
│   │   │   ├── PracticePage.jsx      # Practice mode
│   │   │   ├── TestPage.jsx          # Full-screen test with proctoring
│   │   │   ├── ResultsPage.jsx       # Test analysis
│   │   │   ├── AdminDashboard.jsx    # Admin home
│   │   │   ├── AdminUsersPage.jsx    # User management
│   │   │   └── AdminQuestionsPage.jsx # Question management
│   │   ├── store/stores.js           # Zustand state management
│   │   ├── services/api.js           # API layer (Axios)
│   │   ├── hooks/useProctoring.js    # Proctoring logic
│   │   ├── utils/helpers.js          # Helper functions
│   │   ├── layouts/Layout.jsx        # Layout components
│   │   ├── App.jsx                   # Main app with routes
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html                    # HTML template
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md                         # This file
└── .gitignore
```

## 🔑 Core Features

### 1. **Authentication & Authorization**
- Secure JWT-based login
- Role-based access control (Student vs Admin)
- HTTP-only secure cookies
- Session management

### 2. **Practice Mode**
- Filter questions by: Subject, Topic, Year
- Instant feedback with explanations
- Question bookmarking (marked for review)
- Progress tracking

### 3. **Proctored Test Mode** (Most Important)
The test enforces exam integrity through:

1. **Tab Switch Detection** 
   - Monitors `visibilityState` and browser blur events
   - Logs violation immediately

2. **Violation Tracking**
   - First violation: Strict warning
   - Second violation: Auto-submit test with ZERO score
   - Backend records violations for audit

3. **Fullscreen Enforcement**
   - Requests fullscreen on test start
   - Exiting fullscreen counts as violation

4. **Server-Synced Timer**
   - Prevents client-side time manipulation
   - Auto-submits when time expires

5. **Back Button Prevention**
   - Disables browser back navigation
   - Force page stay

### 4. **Results & Analytics**
- Detailed score breakdown
- Accuracy percentage
- Question-wise analysis
- Performance trends (Recharts)
- Time spent per question

### 5. **Admin Dashboard**
- Platform statistics
- User management (block/unblock/delete)
- Question CRUD operations
- Platform-wide analytics

## 🔐 Security Features

- **Helmet.js**: Sets HTTP headers for security
- **CORS**: Configured to frontend URL only
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Joi + Express-validator
- **Password Hashing**: bcryptjs with salt
- **JWT**: Secure token-based auth
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Proctoring Logic**: Prevents test cheating

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user
```

### Questions (Public)
```
GET    /api/questions/subjects                - List all subjects
GET    /api/questions/subjects/:id            - Get subject
GET    /api/questions/questions               - Get questions (with filters)
GET    /api/questions/questions/:id           - Get question detail
```

### Questions (Admin Only)
```
POST   /api/questions/subjects              - Create subject
PUT    /api/questions/subjects/:id          - Update subject
DELETE /api/questions/subjects/:id          - Delete subject
POST   /api/questions/questions             - Create question
PUT    /api/questions/questions/:id         - Update question
DELETE /api/questions/questions/:id         - Delete question
```

### Tests (Student Only)
```
POST   /api/tests/start                     - Start new test
GET    /api/tests/:testId                   - Get test details
POST   /api/tests/:testId/answer            - Save answer
POST   /api/tests/:testId/submit            - Submit test
POST   /api/tests/:testId/violation         - Record violation
GET    /api/tests/:testId/results           - Get results
GET    /api/tests/history                   - Get test history
```

### Admin
```
GET    /api/admin/users                     - Get all users
PATCH  /api/admin/users/:id/toggle-block    - Block/unblock user
DELETE /api/admin/users/:id                 - Delete user
GET    /api/admin/dashboard/stats           - Dashboard stats
GET    /api/admin/analytics                 - Platform analytics
```

## 📊 Database Schema

### Collections

**User**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  isBlocked: Boolean,
  createdAt: Date
}
```

**Subject** (e.g., "Data Structures")
```javascript
{
  name: String (unique),
  code: String (unique)
}
```

**Question**
```javascript
{
  subjectId: ObjectId,
  topicId: ObjectId,
  year: Number,
  questionText: String,
  options: [String, String, String, String],
  correctOption: 0-3,
  explanation: String,
  marks: 1 | 2,
  negativeMarks: 0.33 | 0.66
}
```

**TestAttempt**
```javascript
{
  userId: ObjectId,
  questions: [{
    questionId: ObjectId,
    selectedOption: 0-3,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  totalScore: Number,
  maxScore: Number,
  violations: Number,
  status: 'in-progress' | 'completed' | 'aborted' | 'zeroed_due_to_violation',
  startTime: Date,
  endTime: Date
}
```

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Local**: Ensure MongoDB is running (`mongod` command)
- **Atlas**: Check connection string in .env
- **Verify**: `mongo "mongodb://localhost:27017"` should connect

### "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### "Frontend can't reach backend"
- Ensure backend is running on port 5000
- Check FRONTEND_URL in backend/.env
- Verify CORS is configured correctly

### "Seed script fails"
```bash
# Delete old data and reseed
# In MongoDB shell:
db.users.deleteMany({})
db.subjects.deleteMany({})
# Then: npm run seed
```

### "Dependencies missing after npm install"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Add `Procfile`: `web: npm start`
2. Set environment variables in platform
3. Push to Git

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set API base URL to production backend

## 📝 Notes

- All passwords are bcryptjs hashed (never store plain text)
- JWT tokens expire after 7 days
- Proctoring violations are permanent records
- Questions are rated by year and subject
- Admin cannot be created via UI (use seed or direct DB)

## 👨‍💼 Support & Contributing

For issues or feature requests, create an issue in the repository.

## 📄 License

MIT License - Feel free to use for educational purposes.

---

**Built with ❤️ for GATE CSE Aspirants**

**Happy Preparation! 🎓**
