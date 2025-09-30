# Claims Manager - Development Notes

## Project Overview
Full-stack insurance claims management application with document storage capabilities.

**Tech Stack:**
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Databases: PostgreSQL (main data) + MongoDB (document metadata)
- File Upload: Multer middleware

## Current Project Status

### ✅ Completed Features
- Claims submission form with validation
- Claims dashboard with error handling
- Document upload infrastructure (backend ready)
- Error boundaries and array safety checks
- Git repository with clean commit history
- Full backend API structure

### 🔄 In Progress
- Document upload UI integration
- Admin status update functionality

### ✅ Recently Completed
- **Real-Time WebSocket Integration** (Complete)
  - Socket.io client/server communication
  - Real-time claim status notifications
  - Toast notification system with animations
  - Connection status indicators
  - Live dashboard updates without refresh

### 📋 Defense Preparation
**Required:** Implement 1-2 CRUD operations during defense
**Focus:** Demonstrate database relationships (one-to-many, etc.)

**Example relationships to showcase:**
- Claims ↔ Documents (one-to-many)
- Users ↔ Claims (one-to-many)
- Claims ↔ Status Updates (one-to-many)

## Quick Start Commands

### Backend
```bash
cd "C:\Users\PC\Desktop\Claims Manager\Claim-Manager\backend"
npm start
# Server runs on localhost:3001
```

### Frontend
```bash
cd "C:\Users\PC\Desktop\Claims Manager\Claim-Manager\insurance-claims-app"
npm run dev
# App runs on localhost:5173
```

### Database Setup
```bash
# PostgreSQL database should exist: insurance_claims
# MongoDB: Connect to default localhost:27017
```

## Docker Deployment Strategy

### Benefits for Presentation
- **Single command deployment:** `docker-compose up`
- **No installation dependencies** on presentation laptop
- **Consistent environment** across machines
- **Easy recovery** if something breaks

### How Docker Would Work
1. **4 containers:** Frontend, Backend, PostgreSQL, MongoDB
2. **Code editing:** Still works normally in VS Code (volume mounts)
3. **Hot reload:** Vite and nodemon work as usual
4. **Defense friendly:** Can edit code live during presentation

### Example Docker Compose Structure
```yaml
services:
  frontend:    # React app (port 5173)
  backend:     # Express API (port 3001)  
  postgres:    # Main database
  mongodb:     # Document storage
```

## Remote Development Setup

### Thin Laptop + Powerful Desktop
- **Home PC:** Runs all Docker containers, databases, heavy processing
- **Laptop:** VS Code with Remote extensions, browser only
- **Connection:** SSH/VPN to home PC
- **Benefits:** All-day battery, consistent environment, powerful specs

### Implementation Options
1. **VS Code Remote SSH:** Connect directly to home PC
2. **Cloud IDEs:** GitHub Codespaces, GitPod
3. **Docker + Remote:** Containers on home PC, access via web

## Current Issues & Solutions

### Node.js PATH Issues
- **Problem:** Node.js not in system PATH consistently  
- **Solution:** Use full path: `"C:\Program Files\nodejs\node.exe"`
- **Docker Benefit:** Eliminates PATH issues entirely

### Database Connectivity
- **PostgreSQL:** Working (localhost:5432, user: postgres, pass: test)
- **MongoDB:** Ready for connection (localhost:27017)

## File Structure
```
Claim-Manager/
├── backend/               # Express API server
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── config/           # Database connections
│   └── uploads/          # File storage
├── insurance-claims-app/ # React frontend
│   ├── src/pages/        # Main app pages
│   ├── src/components/   # Reusable components
│   └── src/contexts/     # State management
└── run-*.bat            # Startup scripts
```

## Key Architectural Decisions

### Authentication Strategy
- **Current:** Mock user middleware (MVP approach)
- **Production:** JWT tokens with proper login system
- **Defense:** Can implement user registration/login as CRUD demo

### File Storage
- **Files:** Stored in `backend/uploads/claims/`
- **Metadata:** MongoDB documents with file references
- **Relationships:** Documents belong to Claims (foreign key: claimId)

### Error Handling
- **Frontend:** Error boundaries catch React crashes
- **Backend:** Middleware catches API errors
- **Database:** Connection error handling implemented

## Defense Day Strategy

### Preparation Steps
1. **Test on target laptop** (with Docker if possible)
2. **Prepare backup plan** (screenshots/video demo)
3. **Practice CRUD implementation** (15-minute time limit)

### Live Coding Examples
```javascript
// Example: Add document CRUD during defense
app.post('/api/claims/:claimId/documents', (req, res) => {
  // "This demonstrates one-to-many relationship"
  // Claims can have multiple Documents
});

app.get('/api/users/:userId/claims', (req, res) => {
  // "This shows user-to-claims relationship"  
  // Users can have multiple Claims
});
```

### Backup Plans
- **Screenshots** of working application
- **Video recording** of key features
- **Code walkthrough** if live demo fails
- **Architecture explanation** with diagrams

---

*Last updated: September 26, 2025*
*This document preserves key information from Copilot Chat session*