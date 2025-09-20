import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { testConnections } from './src/utils/test-connections';
import { errorHandler, notFound } from './src/middleware/error.middleware';
import { importRoutes } from './src/routes/import.routes';
import { videoRoutes } from './src/routes/video.routes';
import { searchRoutes } from './src/routes/search.routes';
import { qaRoutes } from './src/routes/qa.routes';
import { trainingRoutes } from './src/routes/training.routes';
import { exportRoutes } from './src/routes/export.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/export', exportRoutes)

app.use('/api', notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnections();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();