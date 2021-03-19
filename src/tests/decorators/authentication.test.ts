import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { auth } from '~decorators';
import { HttpException } from '~common';
import { AuthService } from '~modules/auth/services/Auth.service';
import { UserJwtPayload } from '~types';

describe.only('auth decorator', () => {
  const mockSomeFunction = jest.fn().mockImplementation((...args) => {
    const res = args[1] as express.Response;
    res.status(123).json({ test: 'ok' });
  });

  class TestClass {
    @auth
    async mockMethod(
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      return mockSomeFunction(req, res, next);
    }
  }

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
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call next with HttpException error when no authorization header', async () => {
    req.setHeaders({ 'X-Custom-Header': 'foo' });

    const mockValidateAuthToken = jest
      .spyOn(AuthService, 'validateAuthToken')
      .mockImplementation(() => Promise.resolve(undefined));

    const testClass = new TestClass();

    await testClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockValidateAuthToken).not.toBeCalled();
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 403);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      expect.stringMatching(/not authorized. missing authentication header/i)
    );
    expect(mockSomeFunction).not.toBeCalled();
  });

  it('should call next with HttpException error when passed auth token is invalid', async () => {
    req.setHeaders({
      'X-Custom-Header': 'foo',
      Authorization: 'Bearer auth_token',
    });

    const mockValidateAuthToken = jest
      .spyOn(AuthService, 'validateAuthToken')
      .mockImplementation(() => Promise.resolve(undefined));

    const testClass = new TestClass();

    await testClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(mockValidateAuthToken).toBeCalled();
    expect(next).toBeCalled();
    expect(res).not.toBeCalled();

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty<number>('statusCode', 403);
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      expect.stringMatching(/not authorized. invalid token/i)
    );
    expect(mockSomeFunction).not.toBeCalled();
  });

  it('should call decorated method', async () => {
    req.setHeaders({
      'X-Custom-Header': 'foo',
      Authorization: 'Bearer auth_token',
    });

    const res = new Response();

    const mockValidateAuthToken = jest
      .spyOn(AuthService, 'validateAuthToken')
      .mockImplementation(() => Promise.resolve({ email: 'foo@mail.com' }));

    const testClass = new TestClass();

    await testClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(res.statusCode).toBe(123);
    expect(res.json).toBeCalledWith({ test: 'ok' });
    expect(next).not.toBeCalled();
    expect(
      ((req as unknown) as express.Request).user
    ).toStrictEqual<UserJwtPayload>({
      email: 'foo@mail.com',
    });
    expect(mockValidateAuthToken).toBeCalled();
    expect(mockSomeFunction).toBeCalled();
  });
});
