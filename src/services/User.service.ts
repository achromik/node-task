import { JsonDB } from 'node-json-db';

import { db } from '../database/db';
import { staticDecorator } from '../decorators/static';
import { User } from '../types';

export interface UserServiceInterface {
  saveUserKeys: () => void;
}

export interface UserServiceStaticInterfacePart {
  new (): UserServiceInterface;
  getUserByEmail: (email: string) => User | undefined;
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

  saveUserKeys(): void {
    throw new Error('Not Implemented yet');
  }
}
