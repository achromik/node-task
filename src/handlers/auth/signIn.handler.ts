import { Request, Response } from 'express';

import { HttpException } from '../../common/HttpException';

export function signInHandler(_req: Request, _res: Response): void {
  throw new HttpException(501, 'Sign In not implemented yet');
}
