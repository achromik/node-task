import { JsonDB } from 'node-json-db';

import { db } from '../database/db';
import { RsaKeys, User, UserWithRsaKeys } from '~types';
import { HttpException } from '~common';

export class UserRepository {
  private static _db: JsonDB = db;
  private static _slug = '/users';

  static get slug(): string {
    return UserRepository._slug;
  }

  static get db(): JsonDB {
    return UserRepository._db;
  }

  static getUserByEmail(email: string): User {
    const userIndex = UserRepository.getUserIndex(email);

    const user = UserRepository.db.getData(
      `${UserRepository.slug}[${userIndex}]`
    );

    return user;
  }

  static saveUserRsaKeys(email: string, { publicKey }: RsaKeys): void {
    const userIndex = UserRepository.getUserIndex(email);

    UserRepository.db.push(
      `${UserRepository.slug}[${userIndex}]`,
      { rsaKeys: { publicKey } },
      false
    );
  }

  static getUserIndex(email: string): number {
    const userIndex = UserRepository.db.getIndex(
      UserRepository.slug,
      email,
      'email'
    );

    if (userIndex === -1) {
      throw new HttpException(404, 'User not found');
    }
    return userIndex;
  }

  static getUserPublicKey(email: string): string | undefined {
    const userIndex = UserRepository.getUserIndex(email);

    const user: UserWithRsaKeys = UserRepository.db.getData(
      `${UserRepository.slug}[${userIndex}]`
    );

    return user?.rsaKeys?.publicKey;
  }
}
