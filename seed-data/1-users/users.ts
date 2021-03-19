import { ObjectId } from 'bson';
import { getObjectId } from 'mongo-seeding';

import { UserDocument } from '~models';

type UserData = Pick<UserDocument, 'email' | 'password'> & { id: ObjectId };

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
