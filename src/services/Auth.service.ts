import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

import { config } from '../config';
import { UserJwtPayload } from '../types';
import { UserService } from './User.service';

export class AuthService {
  static async validatePassword(
    password: string,
    encryptedPassword: string
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, encryptedPassword);

    return isValid;
  }

  static generateAuthToken(email: string): string {
    const token = JWT.sign({ email }, config.JWT_SECRET, {
      expiresIn: config.JWT_TTL,
    });
    return token;
  }

  static validateAuthToken(authHeader = ''): UserJwtPayload | undefined {
    const authToken = authHeader.split(' ')[1] || '';

    try {
      const payload = JWT.verify(
        authToken,
        config.JWT_SECRET
      ) as UserJwtPayload;

      const user = UserService.getUserByEmail(payload.email);

      if (!user) {
        return undefined;
      }

      return { email: payload.email };
    } catch (err) {
      return undefined;
    }
  }
}
