import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { auth } from '../../decorators/authentication';
import { HttpException } from '../../common/HttpException';
import { AuthService } from '../../services/Auth.service';
import { UserJwtPayload } from '../../types';

jest.mock('../../services/Auth.service');

const mockSomeFunction = jest.fn().mockImplementation((...args) => {
  const res = args[1] as express.Response;
  res.status(123).json({ test: 'ok' });
});

class TestClass {
  @auth
  static mockMethod(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    mockSomeFunction(req, res, next);
  }
}

describe('auth decorator', () => {
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

  it('should call next with HttpException error when no authorization header', () => {
    req.setHeaders({ 'X-Custom-Header': 'foo' });

    TestClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty('statusCode');
    expect(nextCallArg).toHaveProperty('message');
    expect(nextCallArg.statusCode).toBe(403);
    expect(nextCallArg.message).toMatch(
      /not authorized. missing authentication header/i
    );

    expect(mockSomeFunction).not.toBeCalled();
  });

  it('should call next with HttpException error when passed auth token is invalid', () => {
    req.setHeaders({
      'X-Custom-Header': 'foo',
      Authorization: 'Bearer auth_token',
    });

    const mockValidateAuthToken = jest.fn().mockReturnValue(false);
    AuthService.generateAuthToken = mockValidateAuthToken;

    TestClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty('statusCode', 403);
    expect(nextCallArg).toHaveProperty('message');
    expect(nextCallArg.message).toMatch(/not authorized. invalid token/i);

    expect(mockSomeFunction).not.toBeCalled();
  });

  it('should call decorated method', () => {
    req.setHeaders({
      'X-Custom-Header': 'foo',
      Authorization: 'Bearer auth_token',
    });

    const res = new Response();

    const mockValidateAuthToken = jest
      .fn()
      .mockReturnValue({ email: 'foo@mail.com' });
    AuthService.validateAuthToken = mockValidateAuthToken;

    TestClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(res.statusCode).toBe(123);
    expect(res.json).toBeCalledWith({ test: 'ok' });
    expect(req).toHaveProperty('user');
    expect(
      ((req as unknown) as express.Request).user
    ).toStrictEqual<UserJwtPayload>({
      email: 'foo@mail.com',
    });
    expect(mockSomeFunction).toBeCalled();
  });
});
