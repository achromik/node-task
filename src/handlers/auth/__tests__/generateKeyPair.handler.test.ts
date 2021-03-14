import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { generateKeyPairHandler } from '../generateKeyPair.handler';
import { UserService } from '../../../services/User.service';
import { HttpException } from '../../../common/HttpException';
import { config } from '../../../config';
import { RsaKeys } from '../../../types';

const mockGenerateKeyPair = jest.fn();

jest.mock('util', () => ({
  promisify: jest.fn(() => mockGenerateKeyPair),
}));
jest.mock('../../../services/User.service');

describe('generateKeyPair.handler', () => {
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

  it('should call next when crypto.generateKeyPair throws an error', async () => {
    mockGenerateKeyPair.mockImplementation(() => {
      throw new Error('Foo error');
    });

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockGenerateKeyPair).toHaveBeenCalledWith<
      [string, typeof config.rsaProps.options]
    >('rsa', config.rsaProps.options);
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>('message', 'Foo error');
  });

  it('should call next when request does not have user context', async () => {
    mockGenerateKeyPair.mockImplementation(() => ({
      publicKey: 'pub_key',
      privateKey: 'priv_key',
    }));

    const mockSaveUserRsaKeys = jest.fn();
    UserService.saveUserRsaKeys = mockSaveUserRsaKeys;

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockSaveUserRsaKeys).not.toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'Missing user context'
    );
  });

  it('should call next when saving keys in db fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = { email: 'foo@mail.com' };

    mockGenerateKeyPair.mockImplementation(() => ({
      publicKey: 'pub_key',
      privateKey: 'priv_key',
    }));

    const mockSaveUserRsaKeys = jest.fn().mockImplementation(() => {
      throw new Error('User not found');
    });
    UserService.saveUserRsaKeys = mockSaveUserRsaKeys;

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockSaveUserRsaKeys).toBeCalledWith<[string, RsaKeys]>(
      'foo@mail.com',
      {
        publicKey: 'pub_key',
        privateKey: 'priv_key',
      }
    );
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>('message', 'User not found');
  });

  it('should response with 200 and with keys in body', async () => {
    const rsaKeys: RsaKeys = {
      publicKey: 'pub_key',
      privateKey: 'priv_key',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = { email: 'foo@mail.com' };

    const res = new Response();

    mockGenerateKeyPair.mockImplementation(() => rsaKeys);

    const mockSaveUserRsaKeys = jest.fn();
    UserService.saveUserRsaKeys = mockSaveUserRsaKeys;

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(next).not.toBeCalled();
    expect(mockSaveUserRsaKeys).toBeCalledWith<[string, RsaKeys]>(
      'foo@mail.com',
      rsaKeys
    );
    expect(res.json).toBeCalledWith(rsaKeys);
    expect(res.statusCode).toBe(200);

    res.resetMocked();
  });
});
