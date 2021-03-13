import { JsonDB } from 'node-json-db';

import { db } from '../database/db';
import { staticDecorator } from '../decorators/static';
import { User } from '../types';
import { HttpException } from '../common/HttpException';

export interface UserServiceInterface {
  addUser: (user: User) => User;
}

export interface UserServiceStaticInterfacePart {
  new (): UserServiceInterface;
  getUserByEmail: (email: string) => User | undefined;
}

@staticDecorator<UserServiceStaticInterfacePart>()
export class UserService {
  static db: JsonDB = db;
  static slug = '/users';

  addUser(_user: User): User {
    throw new HttpException(501, 'Not Implemented yet');
  }

  static getUserByEmail(email: string): User | undefined {
    const userIndex = UserService.db.getIndex('/users', email, 'email');

    if (userIndex === -1) {
      return undefined;
    }

    const user = UserService.db.getData(`/users[${userIndex}]`);

    return user;
  }
}
