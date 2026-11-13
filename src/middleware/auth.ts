import { NextFunction, Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq, sql } from 'drizzle-orm';

export interface AuthUserRecord {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: AuthUserRecord;
}

export async function syncFirebaseUser(decoded: DecodedIdToken): Promise<AuthUserRecord> {
  const email = decoded.email || `${decoded.uid}@user.local`;
  const name = decoded.name || '';

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.uid, decoded.uid))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].email !== email || (name && existing[0].name !== name)) {
      const updated = await db
        .update(users)
        .set({ email, name: name || existing[0].name })
        .where(eq(users.uid, decoded.uid))
        .returning();
      return updated[0];
    }
    return existing[0];
  }

  // Bootstrap first administrator safely if no admin exists yet, or via ADMIN_EMAILS env
  const adminCountRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, 'admin'));
  const adminCount = adminCountRows[0]?.count ?? 0;

  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const shouldBeAdmin = adminCount === 0 || envAdmins.includes(email.toLowerCase());

  const inserted = await db
    .insert(users)
    .values({
      uid: decoded.uid,
      email,
      name,
      role: shouldBeAdmin ? 'admin' : 'customer',
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: { email, name },
    })
    .returning();

  return inserted[0];
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    req.dbUser = await syncFirebaseUser(decoded);
  } catch {
    // Ignore invalid optional token for public routes
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    req.dbUser = await syncFirebaseUser(decoded);
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, () => {
    if (!req.dbUser || req.dbUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Administrator access required.',
      });
    }
    next();
  });
};
