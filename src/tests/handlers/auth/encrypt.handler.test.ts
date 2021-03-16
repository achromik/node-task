import express from 'express';
import { Request } from 'jest-express/lib/request';

import { encryptHandler } from '../../../handlers/auth';
import { HttpException } from '../../../common/HttpException';
import { UserService } from '../../../services/User.service';
import { CryptoService } from '../../../services/Crypto.service';

jest.mock('../../../services/User.service');

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
    UserService.getUserPublicKey = mockGetUserPublicKey;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = { email: 'foo@mail.com' };

    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(CryptoService.prototype as any, '_createCipher')
      .mockImplementation(() => {
        throw new Error('foo test error');
      });

    const mockGetUserPublicKey = jest.fn().mockReturnValue('publicKey');
    UserService.getUserPublicKey = mockGetUserPublicKey;

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
    expect(nextCallArg).toHaveProperty<string>('message', 'foo test error');
  });
});
