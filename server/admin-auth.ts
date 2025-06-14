import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db';
import { adminUsers, adminSessions, type AdminUser, type AdminLoginData, type InsertAdminUser } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

const SALT_ROUNDS = 12;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class AdminAuthService {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate session ID
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Check if email is authorized for admin access
  isAuthorizedEmail(email: string): boolean {
    const authorizedEmails = [
      'peter@spurgeonproperty.com',
      'veruschkia@spurgeonproperty.com', 
      'reshma.kila@evogroup.co.za',
      'malcolmgov24@gmail.com'
    ];
    
    // Case-insensitive email comparison
    return authorizedEmails.some(authorizedEmail => 
      authorizedEmail.toLowerCase() === email.toLowerCase()
    );
  }

  // Register new admin user
  async registerAdmin(userData: InsertAdminUser): Promise<AdminUser> {
    // Check if email is authorized for admin access
    if (!this.isAuthorizedEmail(userData.email)) {
      throw new Error("Email domain not authorized for admin access");
    }

    const passwordHash = await this.hashPassword(userData.password);
    
    const [adminUser] = await db
      .insert(adminUsers)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'admin',
        passwordHash,
      })
      .returning();

    return adminUser;
  }

  // Login admin user
  async loginAdmin(credentials: AdminLoginData): Promise<{ user: AdminUser; sessionId: string } | null> {
    // Check if email is authorized for admin access
    if (!this.isAuthorizedEmail(credentials.email)) {
      throw new Error("Email domain not authorized for admin access");
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(and(
        eq(adminUsers.email, credentials.email),
        eq(adminUsers.isActive, true)
      ));

    if (!user) {
      return null;
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Create session
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await db.insert(adminSessions).values({
      id: sessionId,
      adminUserId: user.id,
      expiresAt,
    });

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));

    return { user, sessionId };
  }

  // Validate session
  async validateSession(sessionId: string): Promise<AdminUser | null> {
    const [session] = await db
      .select({
        user: adminUsers,
        session: adminSessions,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
      .where(and(
        eq(adminSessions.id, sessionId),
        gt(adminSessions.expiresAt, new Date()),
        eq(adminUsers.isActive, true)
      ));

    return session?.user || null;
  }

  // Logout (delete session)
  async logout(sessionId: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.id, sessionId));
  }

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    await db
      .delete(adminSessions)
      .where(and(
        eq(adminSessions.expiresAt, new Date())
      ));
  }

  // Get admin user by ID
  async getAdminById(id: number): Promise<AdminUser | null> {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(and(
        eq(adminUsers.id, id),
        eq(adminUsers.isActive, true)
      ));

    return user || null;
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const [user] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    return !!user;
  }
}

export const adminAuthService = new AdminAuthService();

// Middleware to protect admin routes
export const requireAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies?.adminSession;

    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await adminAuthService.validateSession(sessionId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user to request
    (req as any).adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user is already authenticated
export const redirectIfAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies?.adminSession;

    if (sessionId) {
      const user = await adminAuthService.validateSession(sessionId);
      if (user) {
        return res.redirect('/admin/dashboard');
      }
    }

    next();
  } catch (error) {
    console.error('Redirect middleware error:', error);
    next();
  }
};