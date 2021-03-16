import * as fs from 'fs';

import { HttpException } from '../common/HttpException';
import { staticDecorator } from '../decorators';

export type OnDataFunction = (chunk: string | Buffer) => void;
export type OnEndFunction = () => { data: string };
export type OnErrorFunction = (err: Error) => void;

export interface FileServiceInterface {
  read: (
    onData: OnDataFunction,
    onEnd: OnEndFunction,
    onError: OnErrorFunction
  ) => void;
}

export interface FileServiceStaticInterfacePart {
  readFile: (fileName: string) => Promise<Buffer>;
}

@staticDecorator<FileServiceStaticInterfacePart>()
export class FileService {
  #rs: fs.ReadStream;

  constructor(filePath: string) {
    this.#rs = fs.createReadStream(filePath);
  }

  public async read(
    onData: OnDataFunction,
    onEnd: OnEndFunction,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onError: OnErrorFunction = (_err) => {}
  ): Promise<{ data: string }> {
    return new Promise((resolve, reject) => {
      this.#rs
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
