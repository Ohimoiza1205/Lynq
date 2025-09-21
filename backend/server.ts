import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { testConnections } from './src/utils/test-connections';
import { errorHandler, notFound } from './src/middleware/error.middleware';
import { importRoutes } from './src/routes/import.routes';
import { videoRoutes } from './src/routes/video.routes';
import { searchRoutes } from './src/routes/search.routes';
import { qaRoutes } from './src/routes/qa.routes';
import { trainingRoutes } from './src/routes/training.routes';
import { exportRoutes } from './src/routes/export.routes';

dotenv.config();

// DIAGNOSTIC TEST - Add this right here
console.log('Creating Express app...');
const app = express();
console.log('Express app created successfully');

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Add test route BEFORE any middleware
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.send('Server is working!');
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://lynq.video'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API OK', 
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/import', importRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/videos', qaRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/export', exportRoutes);

app.use('/api', notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    await testConnections();
    console.log('Test connections completed');
    
    await connectDatabase();
    console.log('Database connection completed');
    
    console.log(`Attempting to bind to IPv4 localhost:${PORT}...`);
    
    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server successfully running on http://127.0.0.1:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
      console.log(`Test endpoint: http://127.0.0.1:${PORT}/test`);
    });
    
    server.on('error', (error: any) => {
      console.error('Server error event:', error);
      process.exit(1);
    });
    
    server.on('listening', () => {
      const addr = server.address();
      console.log('Server listening on:', addr);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();