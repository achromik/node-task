import { Request, Response } from 'express';

import { HttpException } from '../../common/HttpException';

export function generateKeyPairHandler(_req: Request, _res: Response): void {
  throw new HttpException(501, 'Generating Key Pair not implemented yet');
}
