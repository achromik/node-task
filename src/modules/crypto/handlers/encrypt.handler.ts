import { NextFunction, Request, Response } from 'express';

import { HttpException } from '~common';
import { CryptoService } from '../services/Crypto.service';

export async function encryptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new HttpException(400, 'Missing user context');
    }

    const data = await CryptoService.encryptFile(req.user.email);

    res.status(200).json(data);
  } catch (err) {
    if (!err.statusCode) {
      next(new HttpException(500, err.message));
    }
    next(err);
  }
}
