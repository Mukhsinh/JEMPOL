import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
  };
}

/**
 * Middleware to verify JWT token
 */
export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token tidak ditemukan',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Token tidak valid',
    });
  }
};
