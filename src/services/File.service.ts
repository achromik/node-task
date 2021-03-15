import * as fs from 'fs';

import { HttpException } from '../common/HttpException';
import { staticDecorator } from '../decorators';

export type OnData = (chunk: string | Buffer) => void;
export type OnEnd = () => void;
export type OnError = (err: Error) => void;

export interface FileServiceInterface {
  read: (onData: OnData, onEnd: OnEnd, onError: OnError) => void;
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

  public read(
    onData: OnData,
    onEnd: OnEnd,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onError: OnError = (_err) => {}
  ): void {
    this.#rs
      .on('data', (chunk) => onData(chunk))
      .on('end', () => onEnd())
      .on('error', (err) => {
        onError(err);
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
