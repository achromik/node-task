import { getObjectId } from 'mongo-seeding';

import { IUser } from '../../src/models/user';

type UserData = Pick<IUser, 'id' | 'email' | 'password'>;

const users: UserData[] = [
  {
    id: getObjectId('user1'),
    email: 'user@mail.com',
    password: '$2b$10$.BxVktZXPav6Te0rKPK73OHG7FeLYwGHYmeZ2/IBtGI29JuXBNWYC',
  },
  {
    id: getObjectId('user2'),
    email: 'admin@mail.com',
    password: '$2b$10$jY7ukYPpG3QDjfnD.OR4v.adS4j/s1AfrJSvZ.fJbQdUlLOAGRbSq',
  },
];

export = users;
