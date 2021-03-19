import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

import { config } from '~config';
import { UserJwtPayload } from '~types';
import { UserRepository } from '~repository/UserRepository';
import { User } from '~models';
import { HttpException } from '~common';

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

  static async validateAuthToken(
    authHeader = ''
  ): Promise<UserJwtPayload | undefined> {
    const authToken = authHeader.split(' ')[1] || '';

    try {
      const payload = JWT.verify(
        authToken,
        config.JWT_SECRET
      ) as UserJwtPayload;

      const userRepository = new UserRepository();

      const user = await userRepository.findOne({ email: payload.email });

      if (!user) {
        return undefined;
      }

      return { email: user.email };
    } catch (err) {
      return undefined;
    }
  }

  static async signIn({ email, password }: User): Promise<string> {
    console.log(email, password);
    if (!email || !password) {
      throw new HttpException(400, 'Missing email or password');
    }

    const userRepository = new UserRepository();

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new HttpException(404, 'User not found');
    }

    const isValid = await AuthService.validatePassword(password, user.password);

    if (!isValid) {
      throw new HttpException(401, 'Not authenticated');
    }

    const authToken = AuthService.generateAuthToken(email);

    return authToken;
  }
}
