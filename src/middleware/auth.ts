import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Sistema simples de autenticação por senha
  // Em produção, use JWT ou sessões mais robustas
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.headers.authorization?.replace('Bearer ', '') || req.body.password;

  if (providedPassword === adminPassword) {
    req.isAuthenticated = true;
    return next();
  }

  res.status(401).json({
    success: false,
    message: 'Acesso negado. Senha de administrador necessária.',
    code: 'UNAUTHORIZED'
  });
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.headers.authorization?.replace('Bearer ', '') || req.body.password;
  
  // Verificar cookie de sessão
  const adminToken = req.cookies?.admin_token;
  const passwordFromCookie = adminToken ? Buffer.from(adminToken, 'base64').toString('utf-8') : null;

  req.isAuthenticated = providedPassword === adminPassword || passwordFromCookie === adminPassword;
  next();
};



