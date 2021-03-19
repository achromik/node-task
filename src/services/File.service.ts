import * as fs from 'fs';

import { HttpException } from '~common';

export type OnDataFunction = (chunk: string | Buffer) => void;
export type OnEndFunction = () => { data: string };

export class FileService {
  private static _createReadSteam(filePath: string): fs.ReadStream {
    return fs.createReadStream(filePath);
  }

  public static async read(
    filePath: string,
    { onData, onEnd }: { onData: OnDataFunction; onEnd: OnEndFunction }
  ): Promise<{ data: string }> {
    const rs = FileService._createReadSteam(filePath);

    return new Promise((resolve, reject) => {
      rs.on('data', (chunk) => onData(chunk))
        .on('end', () => {
          const data = onEnd();
          resolve(data);
        })
        .on('error', (err: Error) => {
          reject(new HttpException(500, `FileRead: ${err.message}}`));
        });
    });
  }
}
