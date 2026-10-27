import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export type Role = "ADMIN" | "USER" | "SUPERADMIN" | string;

export interface UserPayload { userId: string; username: string; role: Role; }

declare global { namespace Express { interface Request { user?: UserPayload; } } }

const JWT_SECRET = process.env.JWT_SECRET || "tarombo_sidabukke_secure_random_key_2026";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) { res.status(401).json({ message: 'Token ndang dapot.' }); return; }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) { res.status(403).json({ message: 'Token ndang ture.' }); return; }
    req.user = decoded as UserPayload;
    next();
  });
};

export const optionalAuthenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  // Abaikan jika tidak ada token, atau isinya string kosong / "undefined" / "null"
  if (!token || token === 'undefined' || token === 'null') {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as UserPayload;
    }
    next();
  });
};

export const requireRole = (roles: Role[]) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403).json({ message: 'Akses ndang olo (ditolak).' });
    return;
  }
  next();
};