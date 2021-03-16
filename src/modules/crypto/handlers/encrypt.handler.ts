import { NextFunction, Request, Response } from 'express';

import { HttpException } from '~common';
import { UserRepository } from '~repositories/User.repository';
import {
  FileService,
  OnDataFunction,
  OnEndFunction,
  OnErrorFunction,
} from '../../../services/File.service';
import { CryptoService } from '../services/Crypto.service';
import { config } from '~config';

export async function encryptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('Missing user context');
    }

    const publicKey: string | undefined = UserRepository.getUserPublicKey(
      req.user.email
    );

    if (typeof publicKey == 'undefined') {
      throw new HttpException(
        400,
        'Unable to encrypt due to missing RSA keys. Try to generate RSA keys'
      );
    }

    const cipher = new CryptoService(publicKey);

    const file = new FileService(config.filePath);

    const data = await file.read(
      fileReadOnData(cipher),
      fileReadOnEnd(cipher),
      fileReadOnError(next)
    );

    res.status(200).json(data);
  } catch (err) {
    next(new HttpException(400, err.message));
  }
}

function fileReadOnData(cipher: CryptoService): OnDataFunction {
  return (chunk: string | Buffer) => cipher.encrypt(chunk as Buffer);
}

function fileReadOnEnd(cipher: CryptoService): OnEndFunction {
  return () => {
    cipher.end();

    return {
      data: `${cipher.aesKeyEncrypted}:${cipher.encrypted}`,
    };
  };
}

function fileReadOnError(next: NextFunction): OnErrorFunction {
  return (err: Error) => {
    next(new HttpException(500, err.message));
  };
}
