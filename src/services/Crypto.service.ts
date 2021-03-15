import * as crypto from 'crypto';

export class CryptoService {
  #aesKey: string;
  #cipher: crypto.Cipher;
  #encrypted: Buffer;
  #publicRsaKey: string;

  constructor(publicRsaKey: string) {
    this.#encrypted = Buffer.from('');
    this.#aesKey = crypto.randomBytes(8).toString('hex');
    this.#publicRsaKey = publicRsaKey;

    this.#cipher = crypto.createCipheriv(
      'aes-128-ecb',
      this.#aesKey,
      null
    ) as crypto.Cipher;
  }

  get key(): string {
    return this.#aesKey;
  }

  get encrypted(): string {
    return this.#encrypted.toString('base64');
  }

  get aesKeyEncrypted(): string {
    return crypto
      .publicEncrypt(this.#publicRsaKey, Buffer.from(this.#aesKey))
      .toString('base64');
  }

  public encrypt(data: Buffer): void {
    console.log(data.toString());

    this.#encrypted = this.#cipher.update(data.toString());
  }

  public end(): void {
    this.#encrypted = Buffer.concat([this.#encrypted, this.#cipher.final()]);
  }
}
