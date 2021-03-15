import { JsonDB } from 'node-json-db';

import { db } from '../database/db';
import { staticDecorator } from '../decorators';
import { RsaKeys, User, UserWithRsaKeys } from '../types';
import { HttpException } from '../common/HttpException';

export interface UserServiceInterface {
  saveUser: () => void;
}

export interface UserServiceStaticInterfacePart {
  new (): UserServiceInterface;
  getUserByEmail: (email: string) => User;
  saveUserRsaKeys: (email: string, { privateKey, publicKey }: RsaKeys) => void;
  getUserIndex: (email: string) => number;
  getUserPublicKey: (email: string) => string;
}

@staticDecorator<UserServiceStaticInterfacePart>()
export class UserService {
  private static _db: JsonDB = db;
  private static _slug = '/users';

  static get slug(): string {
    return UserService._slug;
  }

  static get db(): JsonDB {
    return UserService._db;
  }

  static getUserByEmail(email: string): User {
    const userIndex = UserService.getUserIndex(email);

    const user = UserService.db.getData(`${UserService.slug}[${userIndex}]`);

    return user;
  }

  static saveUserRsaKeys(
    email: string,
    { privateKey, publicKey }: RsaKeys
  ): void {
    const userIndex = UserService.getUserIndex(email);

    UserService.db.push(
      `${UserService.slug}[${userIndex}]`,
      { rsaKeys: { publicKey, privateKey } },
      false
    );
  }

  static getUserIndex(email: string): number {
    const userIndex = UserService.db.getIndex(UserService.slug, email, 'email');

    if (userIndex === -1) {
      throw new HttpException(404, 'User not found');
    }
    return userIndex;
  }

  static getUserPublicKey(email: string): string {
    const userIndex = UserService.getUserIndex(email);

    const user: UserWithRsaKeys = UserService.db.getData(
      `${UserService.slug}[${userIndex}]`
    );

    return user.rsaKeys.publicKey;
  }

  saveUser(): void {
    throw new Error('Not Implemented yet');
  }
}
