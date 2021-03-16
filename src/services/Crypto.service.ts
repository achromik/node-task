import * as crypto from 'crypto';

export class CryptoService {
  #aesKey: string;
  #cipher: crypto.Cipher | null = null;
  #encrypted: Buffer;
  #publicRsaKey: string;

  constructor(publicRsaKey: string) {
    this.#encrypted = Buffer.from('');
    this.#aesKey = crypto.randomBytes(8).toString('hex');
    this.#publicRsaKey = publicRsaKey;

    this._createCipher();
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

  private _createCipher() {
    // throw new Error('fooo cipher error');
    this.#cipher = crypto.createCipheriv(
      'aes-128-ecb',
      this.#aesKey,
      null
    ) as crypto.Cipher;
  }

  public encrypt(data: Buffer): void {
    if (this.#cipher) {
      this.#encrypted = this.#cipher.update(data.toString());
    }
  }

  public end(): void {
    if (this.#cipher) {
      console.log(this.#aesKey);
      this.#encrypted = Buffer.concat([this.#encrypted, this.#cipher.final()]);
    }
  }
}
