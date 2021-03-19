/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { generateKeyPairHandler } from '~modules/crypto/handlers/';
import { UserRepository } from '~repository/UserRepository';
import { HttpException } from '~common';

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

  it('should call next when request does not have user context', async () => {
    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      'Missing user context'
    );
  });

  it('should call next when saving keys in db fails', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    const spyUpdateByEmail = jest
      .spyOn(UserRepository.prototype as any, 'updateByEmail')
      .mockRejectedValue(new Error('Updating failed'));

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(spyUpdateByEmail).toBeCalled();
    expect(spyUpdateByEmail.mock.calls[0][0]).toBe<string>('foo@mail.com');

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 400);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      expect.stringMatching(/updating failed/i)
    );
  });

  it('should response with 200 and with keys in body', async () => {
    (req as any).user = { email: 'foo@mail.com' };

    const res = new Response();

    jest
      .spyOn(UserRepository.prototype as any, 'updateByEmail')
      .mockResolvedValue({});

    await generateKeyPairHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(next).not.toBeCalled();

    expect(res.json).toBeCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('publicKey');
    expect(res.json.mock.calls[0][0]).toHaveProperty('privateKey');

    expect(res.statusCode).toBe(200);

    res.resetMocked();
  });
});
