import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  adminId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  // Also accept token as query param to support EventSource (which cannot set headers)
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (req.query.token as string | undefined);

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { adminId: string };
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Middleware variant for SSE: on auth failure closes the response instead of sending JSON
export function requireAuthSSE(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : (req.query.token as string | undefined);

  if (!token) {
    res.status(401).end();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { adminId: string };
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).end();
  }
}
