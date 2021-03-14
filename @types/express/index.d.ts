import { UserJwtPayload } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}
