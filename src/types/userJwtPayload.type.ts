import { User } from './user.interface';

export type UserJwtPayload = Pick<User, 'email'>;
