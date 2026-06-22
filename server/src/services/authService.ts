import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User.js';
import Profile from '../models/Profile.js';
import env from '../config/env.js';
import { UnauthorizedError, BadRequestError, ConflictError } from '../utils/AppError.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    } as jwt.SignOptions);
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: string = 'developer'
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    const user = await User.create({ name, email, password, role });

    // Create default profile
    await Profile.create({ userId: user._id });

    const tokens = await this.generateTokenPair(user);
    return { user, tokens };
  }

  async login(email: string, password: string): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user);
    
    // Remove password from response
    user.password = undefined as any;
    
    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenEntry = user.refreshTokens.find(
      (rt) => rt.token === refreshToken
    );

    if (!tokenEntry) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token is already used (potential theft)
    if (tokenEntry.used) {
      // Invalidate all refresh tokens for this family
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.family !== tokenEntry.family
      );
      await user.save();
      throw new UnauthorizedError('Refresh token reuse detected. Please login again.');
    }

    // Check if expired
    if (tokenEntry.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Mark current token as used
    tokenEntry.used = true;

    // Generate new token pair
    const newRefreshToken = this.generateRefreshToken();
    const accessToken = this.generateAccessToken(
      user._id.toString(),
      user.role
    );

    // Add new refresh token to same family
    user.refreshTokens.push({
      token: newRefreshToken,
      family: tokenEntry.family,
      used: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Clean up expired tokens
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.expiresAt > new Date()
    );

    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
    });

    if (user) {
      const tokenEntry = user.refreshTokens.find(
        (rt) => rt.token === refreshToken
      );
      if (tokenEntry) {
        // Remove all tokens in this family
        user.refreshTokens = user.refreshTokens.filter(
          (rt) => rt.family !== tokenEntry.family
        );
        await user.save();
      }
    }
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('No user found with that email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();
  }

  private async generateTokenPair(user: IUser): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(
      user._id.toString(),
      user.role
    );
    const refreshToken = this.generateRefreshToken();
    const family = crypto.randomBytes(16).toString('hex');

    user.refreshTokens.push({
      token: refreshToken,
      family,
      used: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Keep only last 5 active families
    const families = [...new Set(user.refreshTokens.map((rt) => rt.family))];
    if (families.length > 5) {
      const oldestFamilies = families.slice(0, families.length - 5);
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => !oldestFamilies.includes(rt.family)
      );
    }

    await user.save();

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
