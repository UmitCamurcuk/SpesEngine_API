import { Request, Response, NextFunction } from 'express';

// Basit auth middleware - req.user'a mock user atıyor
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Mock user object - gerçek sistemde JWT token'dan gelecek
  (req as any).user = {
    id: '507f1f77bcf86cd799439011', // Mock user ID
    username: 'system',
    email: 'system@spesengine.com'
  };
  
  next();
};
