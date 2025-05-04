// server.js - Main Entry Point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

// Import routers
// import userRouter from './routes/users.js';
// import opportunityRouter from './routes/opportunities.js';
// import companyRouter from './routes/companies.js';
import authRouter from './routes/auth.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/users', userRouter);
// app.use('/api/opportunities', opportunityRouter);
// app.use('/api/companies', companyRouter);
app.use('/api/auth', authRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NABTA Volunteering API' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});