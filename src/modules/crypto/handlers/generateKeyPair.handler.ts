import { NextFunction, Request, Response } from 'express';

import { UserRepository } from '~repository/UserRepository';
import { HttpException } from '~common';
import { CryptoService } from '../services/Crypto.service';

export async function generateKeyPairHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('Missing user context');
    }

    const { privateKey, publicKey } = await CryptoService.generateKeyPair();

    const userRepository = new UserRepository();

    await userRepository.updateByEmail(req.user.email, {
      publicKey: publicKey.toString(),
    });

    res.status(200).json({
      privateKey,
      publicKey,
    });
  } catch (err) {
    next(new HttpException(400, err.message));
  }
}
