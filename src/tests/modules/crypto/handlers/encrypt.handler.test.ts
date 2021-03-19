/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { encryptHandler } from '~modules/crypto/handlers';
import { HttpException } from '~common';
import { CryptoService } from '~modules/crypto/services/Crypto.service';

describe('encrypt handler', () => {
  let req: Request;
  let res: jest.Mock;
  let next: jest.Mock;

  beforeEach(() => {
    req = new Request();
    res = jest.fn();
    next = jest.fn();
  });

  afterEach(() => {
    req.resetMocked();
    res.mockRestore();
    next.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call next if no user context was provided', async () => {
    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(res).not.toBeCalled();
    expect(next).toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'Missing user context'
    );
  });

  it('should call next if CryptoService throws an error', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    jest.spyOn(CryptoService, 'encryptFile').mockImplementation(() => {
      throw new Error('CryptoService error');
    });

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(res).not.toBeCalled();
    expect(next).toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 500);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'CryptoService error'
    );
  });

  it('should response with data returned from FileService', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    jest
      .spyOn(CryptoService, 'encryptFile')
      .mockResolvedValue({ data: 'string_encrypted' });

    const res = new Response();

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(res.json).toBeCalledWith<[{ data: string }]>({
      data: 'string_encrypted',
    });
    expect(res.statusCode).toBe<number>(200);
    expect(next).not.toBeCalled();
  });
});
