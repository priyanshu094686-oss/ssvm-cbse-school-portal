import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { ENV } from '../config/env.js';
import { LoginSchema, ChangePasswordSchema, CreateUserSchema } from '../models/types.js';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const AuthController = {
  // POST /api/auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
        });
        return;
      }

      const { email, password } = parsed.data;
      const users = db.getTable('admin_users');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !user.is_active) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' }
        });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' }
        });
        return;
      }

      // Update last login
      user.last_login_at = new Date().toISOString();
      db.saveTable('admin_users', users);

      const tokenPayload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '7d' });

      // Set secure cookie
      res.cookie('ssvm_session', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      await AuditService.log({
        admin_user_id: user.id,
        admin_user_email: user.email,
        action: 'LOGIN',
        entity_type: 'AUTH',
        ip_address: req.ip
      });

      res.json({
        success: true,
        data: {
          token,
          user: tokenPayload
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'An internal error occurred during authentication.' }
      });
    }
  },

  // POST /api/auth/logout
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.log({
        admin_user_id: req.user.id,
        admin_user_email: req.user.email,
        action: 'LOGOUT',
        entity_type: 'AUTH',
        ip_address: req.ip
      });
    }

    res.clearCookie('ssvm_session');
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' }
    });
  },

  // GET /api/auth/me
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not logged in.' }
      });
      return;
    }

    const users = db.getTable('admin_users');
    const user = users.find(u => u.id === req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User profile not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        last_login_at: user.last_login_at
      }
    });
  },

  // POST /api/auth/change-password
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = ChangePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
        });
        return;
      }

      const { current_password, new_password } = parsed.data;
      const users = db.getTable('admin_users');
      const user = users.find(u => u.id === req.user?.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User account not found.' }
        });
        return;
      }

      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'Current password does not match.' }
        });
        return;
      }

      user.password_hash = await bcrypt.hash(new_password, 10);
      user.updated_at = new Date().toISOString();
      db.saveTable('admin_users', users);

      await AuditService.log({
        admin_user_id: user.id,
        admin_user_email: user.email,
        action: 'CHANGE_PASSWORD',
        entity_type: 'USER',
        entity_id: user.id,
        ip_address: req.ip
      });

      res.json({
        success: true,
        data: { message: 'Password changed successfully.' }
      });
    } catch (err) {
      console.error('Password change error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to change password.' }
      });
    }
  },

  // GET /api/auth/users (SUPER_ADMIN only)
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const users = db.getTable('admin_users').map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active,
      last_login_at: u.last_login_at,
      created_at: u.created_at
    }));

    res.json({ success: true, data: users });
  },

  // POST /api/auth/users (SUPER_ADMIN only)
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = CreateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
        });
        return;
      }

      const { email, password, full_name, role } = parsed.data;
      const users = db.getTable('admin_users');

      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_EMAIL', message: 'An administrative user with this email already exists.' }
        });
        return;
      }

      const password_hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: 'usr-' + crypto.randomUUID(),
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role,
        is_active: true,
        last_login_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      users.push(newUser);
      db.saveTable('admin_users', users);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_USER',
        entity_type: 'USER',
        entity_id: newUser.id,
        new_data: { email: newUser.email, role: newUser.role, full_name: newUser.full_name },
        ip_address: req.ip
      });

      res.status(201).json({
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role
        }
      });
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create administrative user.' }
      });
    }
  }
};
