import { Request, Response } from 'express';

import { HttpException } from '../../common/HttpException';

export function encryptHandler(_req: Request, _res: Response): void {
  throw new HttpException(501, 'Encrypt not implemented yet');
}
