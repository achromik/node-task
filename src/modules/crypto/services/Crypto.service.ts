import * as crypto from 'crypto';
import * as util from 'util';

import { RsaKeys } from '~models';
import { config } from '~config';
import { UserRepository } from '~repository/UserRepository';
import { HttpException } from '~common';
import {
  FileService,
  OnDataFunction,
  OnEndFunction,
} from '../../../services/File.service';

export class CryptoService {
  private static _aesKey: string;
  private static _cipher: crypto.Cipher;
  private static _encrypted: Buffer;
  private static _publicRsaKey: string;
  private static RSA = 'rsa' as const;

  private static get encryptedToBase64(): string {
    return CryptoService._encrypted.toString('base64');
  }

  private static get aesKeyEncrypted(): string {
    return crypto
      .publicEncrypt(
        CryptoService._publicRsaKey,
        Buffer.from(CryptoService._aesKey)
      )
      .toString('base64');
  }

  private static _createCipher(): void {
    CryptoService._cipher = crypto.createCipheriv(
      'aes-256-ecb',
      CryptoService._aesKey,
      null
    ) as crypto.Cipher;
  }

  private static _encrypt(data: Buffer): void {
    CryptoService._encrypted = CryptoService._cipher.update(data.toString());
  }

  private static _end(): void {
    CryptoService._encrypted = Buffer.concat([
      CryptoService._encrypted,
      CryptoService._cipher.final(),
    ]);
  }

  private static fileReadOnData(): OnDataFunction {
    return (chunk: string | Buffer) => CryptoService._encrypt(chunk as Buffer);
  }

  private static fileReadOnEnd(): OnEndFunction {
    return () => {
      CryptoService._end();

      return {
        data: `${CryptoService.aesKeyEncrypted}:${CryptoService.encryptedToBase64}`,
      };
    };
  }

  private static _init(publicKey: string): void {
    CryptoService._publicRsaKey = publicKey;

    CryptoService._aesKey = crypto.randomBytes(16).toString('hex');

    CryptoService._createCipher();
  }

  static async encryptFile(
    email: string,
    filePath = config.filePath
  ): Promise<{ data: string }> {
    const userRepository = new UserRepository();

    const user = await userRepository.findOne({
      email,
    });

    if (typeof user?.publicKey == 'undefined') {
      throw new HttpException(
        400,
        'Unable to encrypt due to missing RSA keys. Try to generate RSA keys'
      );
    }

    CryptoService._init(user.publicKey);

    const data = FileService.read(filePath, {
      onData: CryptoService.fileReadOnData(),
      onEnd: CryptoService.fileReadOnEnd(),
    });

    return data;
  }

  static async generateKeyPair(): Promise<RsaKeys> {
    const options = config.rsaProps.options;

    const generateKeyPair = util.promisify(crypto.generateKeyPair);

    const { privateKey, publicKey } = await generateKeyPair(
      CryptoService.RSA,
      options
    );

    return {
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }
}
