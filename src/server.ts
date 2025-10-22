import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  configureVortex,
  createVortexRouter,
  createAllowAllAccessControl
} from '@teamvortexsoftware/vortex-express-5-sdk';
import {
  getCurrentUser,
  authenticateUser,
  createSessionJWT,
  requireAuth,
  getDemoUsers,
  type DemoUser
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Configure Vortex SDK
configureVortex({
  apiKey: process.env.VORTEX_API_KEY || 'demo-api-key',

  // Authentication function that integrates with our demo auth system
  authenticateUser: async (req, res) => {
    const user = getCurrentUser(req);

    if (!user) {
      return null;
    }

    // Convert to Vortex format
    return {
      userId: user.id,
      identifiers: [{ type: 'email', value: user.email }],
      groups: user.groups,
      role: user.role
    };
  },

  // For demo purposes, allow all operations
  // In production, you'd implement proper access control
  ...createAllowAllAccessControl()
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Demo authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create session JWT and set as cookie
  const sessionToken = createSessionJWT(user);
  res.cookie('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      groups: user.groups
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user });
});

// Demo data endpoints
app.get('/api/demo/users', (req, res) => {
  res.json({ users: getDemoUsers() });
});

// Protected demo route
app.get('/api/demo/protected', requireAuth, (req, res) => {
  const user = (req as any).user as DemoUser;
  res.json({
    message: 'This is a protected route!',
    user: user,
    timestamp: new Date().toISOString()
  });
});

// Add Vortex routes
app.use('/api/vortex', createVortexRouter());

// Serve the demo frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    vortex: {
      configured: true,
      routes: [
        '/api/vortex/jwt',
        '/api/vortex/invitations',
        '/api/vortex/invitations/:id',
        '/api/vortex/invitations/accept',
        '/api/vortex/invitations/by-group/:type/:id',
        '/api/vortex/invitations/:id/reinvite'
      ]
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Demo Express server running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to try the demo`);
  console.log(`🔧 Vortex API routes available at http://localhost:${PORT}/api/vortex`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Demo users:');
  console.log('  - admin@example.com / password123 (admin role)');
  console.log('  - user@example.com / userpass (user role)');
});

export default app;