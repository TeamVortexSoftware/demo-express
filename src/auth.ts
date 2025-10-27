import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

// Demo users database (in a real app, this would be in a database)
const users = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10), // hashed 'password123'
    role: 'admin',
    groups: [
      { type: 'team', id: 'team-1', name: 'Engineering' },
      { type: 'organization', id: 'org-1', name: 'Acme Corp' }
    ]
  },
  {
    id: 'user-2',
    email: 'user@example.com',
    password: bcrypt.hashSync('userpass', 10), // hashed 'userpass'
    role: 'user',
    groups: [
      { type: 'team', id: 'team-1', name: 'Engineering' }
    ]
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

export interface DemoUser {
  id: string;
  email: string;
  role: string;
  groups: { type: string; id?: string; groupId?: string; name: string }[];
}

// Create a session JWT for the demo
export function createSessionJWT(user: DemoUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      groups: user.groups
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Verify session JWT
export function verifySessionJWT(token: string): DemoUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      groups: decoded.groups
    };
  } catch {
    return null;
  }
}

// Authenticate user by email and password
export function authenticateUser(email: string, password: string): DemoUser | null {
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    groups: user.groups
  };
}

// Get current user from request (checks cookies for session JWT)
export function getCurrentUser(req: Request): DemoUser | null {
  const token = req.cookies?.session;
  if (!token) {
    return null;
  }

  return verifySessionJWT(token);
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: Function) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Attach user to request for use in other middleware
  (req as any).user = user;
  next();
}

// Get demo users (for testing)
export function getDemoUsers() {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    groups: user.groups
  }));
}