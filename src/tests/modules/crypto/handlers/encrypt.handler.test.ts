/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { encryptHandler } from '~modules/crypto/handlers';
import { HttpException } from '~common';
import { UserRepository } from '~repositories/User.repository';
import { CryptoService } from '~modules/crypto/services/Crypto.service';
import { FileService } from '../../../../services/File.service';
import { config } from '~config';

jest.mock('~repositories/User.repository');

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
    const mockGetUserPublicKey = jest.fn();
    UserRepository.getUserPublicKey = mockGetUserPublicKey;

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(res).not.toBeCalled();
    expect(next).toBeCalledTimes(1);
    expect(mockGetUserPublicKey).not.toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'Missing user context'
    );
  });

  it('should call next if CryptoService throws an error', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    jest
      .spyOn(CryptoService.prototype as any, '_createCipher')
      .mockImplementation(() => {
        throw new Error('CryptoService error');
      });

    const mockGetUserPublicKey = jest.fn().mockReturnValue('publicKey');
    UserRepository.getUserPublicKey = mockGetUserPublicKey;

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(res).not.toBeCalled();
    expect(next).toBeCalledTimes(1);
    expect(mockGetUserPublicKey).toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'CryptoService error'
    );
  });

  it('should call next if FileService throws an error', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    const spyCipher = jest
      .spyOn(CryptoService.prototype as any, '_createCipher')
      .mockReturnValue(null);

    const spyFile = jest
      .spyOn(FileService.prototype as any, '_createReadSteam')
      .mockImplementation(() => {
        throw new Error('FileService error');
      });

    const mockGetUserPublicKey = jest.fn().mockReturnValue('publicKey');
    UserRepository.getUserPublicKey = mockGetUserPublicKey;

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(res).not.toBeCalled();
    expect(next).toBeCalledTimes(1);
    expect(mockGetUserPublicKey).toBeCalled();
    expect(spyCipher).toBeCalled();
    expect(spyFile).toBeCalledWith(config.filePath);
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>('message', 'FileService error');
  });

  it('should response with data returned from FileService', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    const mockGetUserPublicKey = jest.fn().mockReturnValue('publicKey');
    UserRepository.getUserPublicKey = mockGetUserPublicKey;

    const spyCipher = jest
      .spyOn(CryptoService.prototype as any, '_createCipher')
      .mockReturnValue('run cipher');

    const spyCreateReadSteam = jest
      .spyOn(FileService.prototype as any, '_createReadSteam')
      .mockReturnValue(null);

    const spyFileRead = jest
      .spyOn(FileService.prototype, 'read')
      .mockResolvedValue({ data: 'encrypted:string' });

    const res = new Response();

    await encryptHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(res.json).toBeCalled();
    expect(next).not.toBeCalled();
    expect(mockGetUserPublicKey).toBeCalled();
    expect(spyCipher).toBeCalled();
    expect(spyCreateReadSteam).toBeCalledWith(config.filePath);
    expect(spyFileRead).toBeCalled();
  });
});
