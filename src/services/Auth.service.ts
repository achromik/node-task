import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

import { config } from '../config';
import { UserService } from './User.service';

interface Payload {
  email: string;
}

export class AuthService {
  static async validatePassword(
    password: string,
    encryptedPassword: string
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, encryptedPassword);

    return isValid;
  }

  static async generateAuthToken(email: string): Promise<string> {
    const token = JWT.sign({ email }, config.JWT_SECRET, {
      expiresIn: config.JWT_TTL,
    });
    return token;
  }

  static validateAuthToken(authHeader = ''): boolean {
    const authToken = authHeader.split(' ')[1] || '';

    try {
      const payload = JWT.verify(authToken, config.JWT_SECRET);

      const user = UserService.getUserByEmail((payload as Payload).email);

      if (!user) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}
