import { getAuth } from '@clerk/express';

// Strict auth - returns 401 if user is not signed in
export const protect = (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Please sign in to perform this action' });
    }
    req.user = { _id: auth.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
};

// Optional auth - attaches user if signed in, but allows guest access
export const optionalAuth = (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.user = { _id: auth.userId };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
};
