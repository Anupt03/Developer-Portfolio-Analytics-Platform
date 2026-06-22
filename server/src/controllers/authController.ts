import { Response } from 'express';
import authService from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  const { user, tokens } = await authService.register(name, email, password, role);

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
    },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
    },
  });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }

  const tokens = await authService.refreshTokens(token);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { accessToken: tokens.accessToken },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (token) {
    await authService.logout(token);
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const resetToken = await authService.forgotPassword(email);

  // In production, send email. For development, return token
  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log(`🔑 Password Reset URL: ${resetUrl}`);

  res.json({
    success: true,
    message: 'Password reset link sent to email',
    ...(process.env.NODE_ENV === 'development' && { resetUrl }),
  });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  await authService.resetPassword(token, password);

  res.json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user!._id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        avatar: req.user!.avatar,
      },
    },
  });
});
