import { JsonDB } from 'node-json-db';

import { db } from '../database/db';
import { staticDecorator } from '../decorators/static';
import { User } from '../types';

export interface UserServiceInterface {
  saveUser: () => void;
}

interface RsaKeys {
  publicKey: string;
  privateKey: string;
}
export interface UserServiceStaticInterfacePart {
  new (): UserServiceInterface;
  getUserByEmail: (email: string) => User | undefined;
  saveUserRsaKeys: (email: string, { privateKey, publicKey }: RsaKeys) => void;
  getUserIndex: (email: string) => number | undefined;
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

  static getUserByEmail(email: string): User | undefined {
    const userIndex = UserService.db.getIndex(UserService.slug, email, 'email');

    if (userIndex === -1) {
      return undefined;
    }

    const user = UserService.db.getData(`${UserService.slug}[${userIndex}]`);

    return user;
  }

  static saveUserRsaKeys(
    email: string,
    { privateKey, publicKey }: RsaKeys
  ): void {
    const userIndex = UserService.getUserIndex(email);

    if (!userIndex) {
      throw new Error('User does not exist');
    }

    UserService.db.push(
      `${UserService.slug}[${userIndex}]`,
      { rsaKeys: { publicKey, privateKey } },
      false
    );
  }

  static getUserIndex(email: string): number | undefined {
    const userIndex = UserService.db.getIndex(UserService.slug, email, 'email');

    if (userIndex === -1) {
      return undefined;
    }
    return userIndex;
  }

  saveUser(): void {
    throw new Error('Not Implemented yet');
  }
}
