# Demo Express App - Vortex Express SDK

A demonstration Express.js application showcasing the Vortex Express 5 SDK integration.

## 🚀 Quick Start

```bash
cd apps/demo-express
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to try the demo!

## 🎯 What This Demo Shows

This demo demonstrates:

- **Easy Vortex Integration**: Single-line setup with `createVortexRouter()`
- **Authentication Integration**: How to connect your auth system to Vortex
- **All Vortex Routes**: JWT generation, invitation management, group operations
- **Access Control**: Using Vortex's access control hooks (simplified for demo)
- **Frontend Integration**: How to call Vortex APIs from a frontend

## 🔧 Features

### Demo Users
- **admin@example.com** / password123 (admin role)
- **user@example.com** / userpass (user role)

### Available Routes

#### Authentication Routes
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user info

#### Vortex Routes (via SDK)
- `POST /api/vortex/jwt` - Generate Vortex JWT
- `GET /api/vortex/invitations` - Get invitations by target
- `GET /api/vortex/invitations/:id` - Get specific invitation
- `DELETE /api/vortex/invitations/:id` - Delete invitation
- `POST /api/vortex/invitations/accept` - Accept invitations
- `GET /api/vortex/invitations/by-group/:type/:id` - Get group invitations
- `DELETE /api/vortex/invitations/by-group/:type/:id` - Delete group invitations
- `POST /api/vortex/invitations/:id/reinvite` - Resend invitation

#### Demo/Utility Routes
- `GET /health` - Health check with Vortex route info
- `GET /api/demo/users` - List demo users
- `GET /api/demo/protected` - Protected route example

## 💻 Usage

### 1. Start the Server
```bash
pnpm dev
```

### 2. Open the Web Interface
Visit [http://localhost:3000](http://localhost:3000) to access the interactive demo interface.

### 3. Test the Flow
1. **Login** with one of the demo users
2. **Generate JWT** to see Vortex JWT creation in action
3. **Test Invitations** by target (email, username, phone)
4. **Test Group Operations** with the demo groups
5. **Try Other Features** like protected routes and health checks

### 4. Direct API Testing
You can also test the APIs directly:

```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"password123"}' \\
  -c cookies.txt

# Then test Vortex JWT generation
curl -X POST http://localhost:3000/api/vortex/jwt \\
  -b cookies.txt
```

## 🔧 Architecture

### Key Integration Points

#### 1. Vortex Configuration
```typescript
configureVortex({
  apiKey: process.env.VORTEX_API_KEY || 'demo-api-key',

  authenticateUser: async (req, res) => {
    const user = getCurrentUser(req);
    return user ? {
      userId: user.id,
      identifiers: [{ type: 'email', value: user.email }],
      groups: user.groups,
      role: user.role
    } : null;
  },

  ...createAllowAllAccessControl()
});
```

#### 2. Route Registration
```typescript
app.use('/api/vortex', createVortexRouter());
```

#### 3. Authentication Bridge
The demo shows how to bridge your existing authentication system with Vortex's authentication requirements.

## 📁 Project Structure

```
apps/demo-express/
├── src/
│   ├── auth.ts          # Authentication utilities
│   └── server.ts        # Main Express server
├── public/
│   └── index.html       # Interactive demo frontend
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Notes

**This is a demo application** - it includes simplified security for demonstration purposes:

- Uses in-memory user storage
- Simplified JWT secrets
- `createAllowAllAccessControl()` for easy testing

For production use:
- Use a real database for user storage
- Implement proper access control hooks
- Use secure JWT secrets and proper session management
- Add input validation and rate limiting
- Use HTTPS in production

## 🛠️ Customization

### Adding Your Own Routes
```typescript
// Add custom routes alongside Vortex
app.get('/api/custom', (req, res) => {
  res.json({ message: 'Custom route!' });
});

// Vortex routes
app.use('/api/vortex', createVortexRouter());
```

### Custom Access Control
```typescript
configureVortex({
  apiKey: process.env.VORTEX_API_KEY!,
  authenticateUser: /* your auth function */,

  // Custom access control instead of createAllowAllAccessControl()
  canDeleteInvitation: async (req, res, user, resource) => {
    return user?.role === 'admin';
  },

  canAccessInvitationsByGroup: async (req, res, user, resource) => {
    return user?.groups.some(g =>
      g.type === resource?.groupType && g.id === resource?.groupId
    );
  }
});
```

## 🔗 Related

- [Vortex Express SDK Documentation](../../packages/vortex-express-5-sdk/README.md)
- [Vortex Node SDK Documentation](../../packages/vortex-node-22-sdk/README.md)
- [Vortex React Provider Documentation](../../packages/vortex-react-provider/README.md)