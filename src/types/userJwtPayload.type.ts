import { User } from '~models';

export type UserJwtPayload = Pick<User, 'email'>;
