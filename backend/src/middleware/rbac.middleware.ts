import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
  };
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'reviewer';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export const requireUploader = requireRole(['uploader', 'admin']);
export const requireReviewer = requireRole(['reviewer', 'uploader', 'admin']);
export const requireAdmin = requireRole(['admin']);