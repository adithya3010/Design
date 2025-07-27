// middleware/auth.js
import passport from 'passport';

// ✅ Protect routes using JWT
export const requireAuth = passport.authenticate('jwt', { session: false });

// ✅ Check if user is logged in (after passport has set req.user)
export const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

// ✅ Only allow if role is 'admin'
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};
