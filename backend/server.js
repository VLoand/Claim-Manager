import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import claimsRoutes from './routes/claims.js';
import usersRoutes from './routes/users.js';
import documentsRoutes from './routes/documents.js';

// Import database connections
import { connectPostgreSQL } from './config/postgres.js';
import { connectMongoDB } from './config/mongodb.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Temporary middleware for MVP - provides default user
const provideDefaultUser = (req, res, next) => {
  // For MVP, use a default user
  req.user = {
    id: 1,
    email: 'demo@example.com',
    role: 'user'
  };
  next();
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', provideDefaultUser, claimsRoutes);
app.use('/api/users', provideDefaultUser, usersRoutes);
app.use('/api', provideDefaultUser, documentsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Insurance Claims API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Database connections and server start
async function startServer() {
  try {
    // Connect to databases
    await connectPostgreSQL();
    await connectMongoDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };