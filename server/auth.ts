import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '..', 'firebase-applet-config.json');

const rawFirebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const projectId: string = rawFirebaseConfig.projectId;

const adminApp = getApps().length === 0 ? initializeApp({ projectId }) : getApp();
const adminAuth = getAuth(adminApp);

export interface VerifiedUser {
  uid: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: VerifiedUser;
    }
  }
}

export async function verifyIdTokenString(idToken: string): Promise<VerifiedUser> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const email = decoded.email || '';
  const name =
    (typeof decoded.name === 'string' && decoded.name.trim()) ||
    (email ? email.split('@')[0] : 'Friend');

  return {
    uid: decoded.uid,
    email,
    name,
  };
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Please sign in with Google to continue.',
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Please sign in with Google to continue.',
    });
  }

  try {
    const user = await verifyIdTokenString(token);
    req.user = user;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Your sign-in session expired or could not be verified. Please sign in again.',
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const email = (req.user?.email || '').trim().toLowerCase();
  if (!email || !config.adminEmails.includes(email)) {
    return res.status(403).json({
      error: 'This page is for the site owner.',
    });
  }
  return next();
}
