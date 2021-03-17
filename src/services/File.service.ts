import * as fs from 'fs';

import { HttpException } from '~common';

export type OnDataFunction = (chunk: string | Buffer) => void;
export type OnEndFunction = () => { data: string };
export type OnErrorFunction = (err: Error) => void;

export class FileService {
  #rs: fs.ReadStream | undefined = undefined;

  constructor(filePath: string) {
    this._createReadSteam(filePath);
  }

  private _createReadSteam(filePath: string) {
    this.#rs = fs.createReadStream(filePath);
  }

  public async read(
    onData: OnDataFunction,
    onEnd: OnEndFunction,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onError: OnErrorFunction = (_err) => {}
  ): Promise<{ data: string }> {
    return new Promise((resolve, reject) => {
      (this.#rs as fs.ReadStream)
        .on('data', (chunk) => onData(chunk))
        .on('end', () => {
          const data = onEnd();
          resolve(data);
        })
        .on('error', (err) => {
          reject(onError(err));
        });
    });
  }

  public static async readFile(fileName: string): Promise<Buffer> {
    try {
      const data = await fs.promises.readFile(fileName);

      return Buffer.from(data);
    } catch (err) {
      throw new HttpException(500, err.message);
    }
  }
}
