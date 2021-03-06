import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import * as util from 'util';

import { UserRepository } from '~repositories/User.repository';
import { config } from '~config';
import { HttpException } from '~common';

export async function generateKeyPairHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('Missing user context');
    }

    const RSA = 'rsa';

    const options = config.rsaProps.options;

    const generateKeyPair = util.promisify(crypto.generateKeyPair);

    const { privateKey, publicKey } = await generateKeyPair(RSA, options);

    UserRepository.saveUserRsaKeys(req.user.email, {
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
