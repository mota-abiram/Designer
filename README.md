# Designer Task Tracker

A modern, real-time task management system built for creative teams to streamline workflow, track deliverables, and monitor team performance. This application replaces traditional spreadsheet-based workflows with an intelligent, automated system designed specifically for design teams and account managers.

---

## 📋 Overview

**Designer Task Tracker** is a Single Page Application (SPA) that transforms how creative teams manage daily tasks, track project quotas, and measure performance. Built with React and Firebase, it provides real-time synchronization, role-based access control, and intelligent task management features that eliminate the manual overhead of spreadsheet maintenance.

### Why This App?

Migrating from Google Sheets to a custom-built application addresses critical limitations:

| Challenge | Spreadsheet Limitation | App Solution |
|-----------|------------------------|--------------|
| **Date Management** | Manual creation of columns/sheets daily | Automatic rollover with dynamic daily columns |
| **Data Integrity** | Invalid entries, accidental deletions | Structured dropdowns and fixed states |
| **Task Assignment** | Inconsistent text entries | Standardized assigners with pre-defined lists |
| **Visibility** | Cluttered view of all tasks | Designer-centric filters and focused views |
| **Analytics** | Complex formulas that break easily | Real-time automated dashboards |
| **Interactivity** | Manual cut & paste operations | Native drag-and-drop rescheduling |

---

## ✨ Features

### Core Task Management
- **📅 Weekly Board View**: Monday-to-Friday layout with dynamic date columns
- **🎯 Task Status Tracking**: Three-state workflow (Pending → Submitted → Rework)
- **🔄 Drag & Drop Rescheduling**: Intuitive task movement between dates
- **➕ Quick Task Creation**: Inline task addition with minimal clicks
- **🔍 Advanced Filtering**: Filter by status, date range, and search queries
- **📝 Task Details Drawer**: Comprehensive task information with edit capabilities

### Designer Experience
- **👤 Designer-Centric Views**: Personalized task boards for each designer
- **🎨 Visual Status Indicators**: Color-coded badges for instant status recognition
- **📊 Personal Workload Tracking**: Individual task counts and completion rates
- **🔔 Task Assignment Notifications**: Visual feedback via toast notifications
- **🌙 Dark Mode Support**: System-wide theme toggle for comfortable viewing

### Manager & Admin Features
- **📈 Performance Dashboard**: Real-time analytics with three dedicated tabs:
  - **Designers Tab**: Individual performance metrics and efficiency rates
  - **Account Managers Tab**: Task assignment tracking and completion rates
  - **Scope Tracking Tab**: Brand quota management with progress visualization
- **📊 Circular Progress Indicators**: Visual tracking for Statics and Reels quotas
- **📅 Date Range Filters**: Today, This Week, This Month, or custom ranges
- **👥 Team Overview**: Aggregated statistics across all team members
- **🎯 Quota Management**: Brand-based delivery tracking with creative type breakdown

### Brand & Category Management
- **🏷️ Brand Configuration**: Add, edit, and manage brand categories
- **🎨 Creative Type Management**: Define and organize creative deliverable types
- **📋 Scope Management**: Configure project scopes (e.g., Social Media, Print)
- **📊 Quota Assignment**: Set targets and track delivered items per brand/scope

### Authentication & Security
- **🔐 Google OAuth Integration**: Secure single sign-on
- **🔒 Protected Routes**: Authentication-required navigation
- **👤 User Profile Management**: Avatar display and user information

### Real-Time Collaboration
- **⚡ Firebase Realtime Sync**: Instant updates across all connected clients
- **🔄 Optimistic UI Updates**: Immediate feedback before server confirmation
- **📡 Live Dashboard Metrics**: Auto-refreshing statistics without page reload
- **🌐 Multi-User Support**: Concurrent editing with conflict resolution

### UI/UX Enhancements
- **🎭 Framer Motion Animations**: Smooth transitions and micro-interactions
- **📱 Fully Responsive Design**: Optimized for desktop, tablet, and mobile
- **🎨 Modern Design System**: Tailwind CSS with custom theme tokens
- **🍞 Toast Notifications**: User-friendly feedback for all actions
- **♿ Accessibility**: Semantic HTML and keyboard navigation support

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0**: Latest React with concurrent features and improved performance
- **TypeScript 5.9.3**: Type-safe development with strict mode enabled
- **Vite 7.2.4**: Next-generation frontend tooling with lightning-fast HMR

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework with custom design tokens
- **Framer Motion 12.23.26**: Production-ready animation library
- **Lucide React 0.561.0**: Beautiful, consistent icon set
- **clsx & tailwind-merge**: Conditional class name utilities

### Backend & Database
- **Firebase 12.6.0**: Complete backend solution including:
  - **Firestore**: NoSQL cloud database with real-time sync
  - **Authentication**: Google OAuth provider
  - **Security Rules**: Server-side data access control

### Routing & State Management
- **React Router DOM 7.10.1**: Client-side routing with protected routes
- **React Context API**: Global state management for tasks, auth, and theme
- **Custom Hooks**: Reusable logic for task operations and filtering

### Developer Experience
- **ESLint 9.39.1**: Code quality and consistency enforcement
- **TypeScript ESLint 8.46.4**: TypeScript-specific linting rules
- **PostCSS 8.5.6**: CSS transformations and autoprefixing
- **Vite Plugin React 5.1.1**: Fast Refresh and JSX optimization

### Utilities & Helpers
- **date-fns 4.1.0**: Modern date utility library for formatting and calculations
- **react-hot-toast 2.6.0**: Elegant toast notification system

---

## 🔒 Security Considerations

### Authentication
- **Google OAuth 2.0**: Industry-standard authentication protocol
- **Firebase Auth**: Secure token-based session management
- **Protected Routes**: Client-side route guards with server-side validation
- **Automatic Session Refresh**: Seamless token renewal

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // All collections require authentication
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated();
    }
    match /quotas/{quotaId} {
      allow read, write: if isAuthenticated();
    }
    match /brands/{brandId} {
      allow read, write: if isAuthenticated();
    }
    match /creativeTypes/{typeId} {
      allow read, write: if isAuthenticated();
    }
    match /scopes/{scopeId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Best Practices Implemented
- ✅ Environment variables for sensitive configuration (`.env` file)
- ✅ No hardcoded credentials in source code
- ✅ HTTPS-only Firebase connections
- ✅ Input validation and sanitization
- ✅ XSS protection via React's built-in escaping
- ✅ CORS configuration for API endpoints

### Recommended Enhancements
- 🔐 Implement role-based security rules in Firestore
- 🔐 Add email verification for new users
- 🔐 Implement rate limiting for API calls
- 🔐 Add audit logging for sensitive operations
- 🔐 Enable Firebase App Check for abuse prevention

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Firebase Account**: Free tier is sufficient
- **Google Cloud Project**: For OAuth configuration

### 1. Clone the Repository
```bash
git clone <repository-url>
cd designer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Enable Google Analytics (optional)

#### Enable Authentication
1. In Firebase Console, navigate to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your domain to authorized domains

#### Create Firestore Database
1. Navigate to **Firestore Database** → **Create database**
2. Start in **production mode** (security rules are already configured)
3. Choose a location close to your users

#### Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" and click the web icon (`</>`)
3. Register your app and copy the configuration

### 4. Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**⚠️ Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

### 5. Deploy Firestore Security Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 6. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Build for Production
```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### 8. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
designer/
├── public/                      # Static assets
│   └── vite.svg                # Favicon
├── src/
│   ├── assets/                 # Images, fonts, and other assets
│   ├── components/             # React components
│   │   ├── common/            # Shared components
│   │   │   ├── AddDesignerModal.tsx
│   │   │   ├── DesignerTabs.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   └── ScopeTrackingTab.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   └── task/              # Task management components
│   │       ├── AddTaskModal.tsx
│   │       ├── TaskCard.tsx
│   │       ├── TaskDrawer.tsx
│   │       ├── TaskGrid.tsx
│   │       ├── TaskToolbar.tsx
│   │       └── ...
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   ├── TaskContext.tsx   # Task and quota management
│   │   └── ThemeContext.tsx  # Dark mode toggle
│   ├── pages/                 # Route components
│   │   ├── Categories.tsx    # Brand/Type/Scope management
│   │   ├── Dashboard.tsx     # Performance analytics
│   │   ├── DesignerBoard.tsx # Main task board
│   │   ├── Login.tsx         # Authentication page
│   │   └── ScopeDashboard.tsx # Scope-specific view
│   ├── services/              # External service integrations
│   │   ├── adminList.ts      # Admin user configuration
│   │   ├── firebase.ts       # Firebase initialization
│   │   └── mockData.ts       # Development seed data
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # Shared interfaces and types
│   ├── utils/                 # Utility functions
│   │   └── cn.ts             # Class name merger
│   ├── App.tsx                # Root component with routing
│   ├── index.css              # Global styles and Tailwind directives
│   └── main.tsx               # Application entry point
├── .env                        # Environment variables (not in repo)
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── firestore.rules            # Firestore security rules
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node-specific TS config
├── vite.config.ts             # Vite build configuration
├── PRESENTATION.md            # Case study documentation
└── README.md                  # This file
```

### Key Directories Explained

- **`components/`**: Organized by feature (common, dashboard, layout, task)
- **`context/`**: Global state management using React Context API
- **`pages/`**: Top-level route components
- **`services/`**: External integrations (Firebase, admin config)
- **`types/`**: Centralized TypeScript definitions for type safety
- **`utils/`**: Helper functions and utilities

---

## 🌐 Browser Support

### Fully Supported Browsers
| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | Recommended for best performance |
| **Firefox** | 88+ | Full feature support |
| **Safari** | 14+ | macOS Big Sur and later |
| **Edge** | 90+ | Chromium-based versions |

### Mobile Browsers
| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome Mobile** | 90+ | Android 8.0+ |
| **Safari iOS** | 14+ | iOS 14+ |
| **Samsung Internet** | 14+ | Android 8.0+ |

### Features Requiring Modern Browsers
- **ES2020+ JavaScript**: Arrow functions, optional chaining, nullish coalescing
- **CSS Grid & Flexbox**: Layout system
- **CSS Custom Properties**: Theme variables
- **Intersection Observer**: Scroll animations
- **Fetch API**: Network requests
- **LocalStorage**: Theme persistence

### Known Limitations
- ❌ **Internet Explorer**: Not supported (deprecated by Microsoft)
- ⚠️ **Safari < 14**: Limited CSS Grid support
- ⚠️ **Firefox < 88**: Potential animation performance issues

### Testing Recommendations
```bash
# Test on multiple browsers using BrowserStack or similar
# Recommended test matrix:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Chrome Mobile (Android)
- Safari Mobile (iOS)
```


