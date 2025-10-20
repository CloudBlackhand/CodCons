import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { SessionService } from './services/sessionService';

// Import routes
import adminRoutes from './routes/admin';
import accessRoutes from './routes/access';
import siteRoutes from './routes/site';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve site static files
app.use('/site', express.static(path.join(__dirname, '../public/site')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/site', siteRoutes);

// Serve admin panel
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Serve site page
app.get('/site', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/index.html'));
});

// Serve site page with token parameter
app.get('/site*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Try to initialize database, but don't fail if it's not available
    await initializeDatabase();
    
    // Start session cleanup service only if database is available
    if (process.env.DATABASE_URL) {
      SessionService.startCleanupInterval();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Admin panel: http://localhost:${PORT}/admin`);
      console.log(`🌐 Site: http://localhost:${PORT}/site`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      
      if (!process.env.DATABASE_URL) {
        console.log('⚠️  PostgreSQL not configured - add DATABASE_URL environment variable');
        console.log('📋 Add PostgreSQL addon in Railway dashboard');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
