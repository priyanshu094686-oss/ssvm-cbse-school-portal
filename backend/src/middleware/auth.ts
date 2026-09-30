import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthUser, UserRole } from '../models/types.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token && req.cookies && req.cookies.ssvm_session) {
    token = req.cookies.ssvm_session;
  }
  if (!token && req.signedCookies && req.signedCookies.ssvm_session) {
    token = req.signedCookies.ssvm_session;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      }
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please sign in again.'
      }
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
      return;
    }

    const userRole = req.user.role;
    
    // SUPER_ADMIN has full permissions across the system
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // SCHOOL_MANAGER has full management permissions equivalent to ADMIN
    const effectiveRoles: UserRole[] = [...allowedRoles];
    if (allowedRoles.includes('ADMIN') && !effectiveRoles.includes('SCHOOL_MANAGER')) {
      effectiveRoles.push('SCHOOL_MANAGER');
    }
    if (allowedRoles.includes('SCHOOL_MANAGER') && !effectiveRoles.includes('ADMIN')) {
      effectiveRoles.push('ADMIN');
    }

    if (!effectiveRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Action requires one of the following roles: ${allowedRoles.join(', ')}.`
        }
      });
      return;
    }

    next();
  };
}
