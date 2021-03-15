import { NextFunction, Request, Response } from 'express';

import { HttpException } from '../../common/HttpException';
import { UserService } from '../../services/User.service';
import {
  FileService,
  OnData,
  OnEnd,
  OnError,
} from '../../services/File.service';
import { CryptoService } from '../../services/Crypto.service';
import { config } from '../../config';

export async function encryptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('Missing user context');
    }

    const publicKey = UserService.getUserPublicKey(req.user.email);

    const cipher = new CryptoService(publicKey);

    const file = new FileService(config.filePath);

    file.read(
      fileReadOnData(cipher),
      fileReadOnEnd(cipher, res),
      fileReadOnError(next)
    );
  } catch (err) {
    next(new HttpException(400, err.message));
  }
}

function fileReadOnData(cipher: CryptoService): OnData {
  return (chunk: string | Buffer) => cipher.encrypt(chunk as Buffer);
}

function fileReadOnEnd(cipher: CryptoService, res: Response): OnEnd {
  return () => {
    cipher.end();
    res.status(200).json({
      data: `${cipher.aesKeyEncrypted}:${cipher.encrypted}`,
    });
  };
}

function fileReadOnError(next: NextFunction): OnError {
  return (err: Error) => {
    next(new HttpException(500, err.message));
  };
}
