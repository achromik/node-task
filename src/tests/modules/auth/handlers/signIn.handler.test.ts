import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { signInHandler } from '~modules/auth/handlers';
import { HttpException } from '~common';
import { AuthService } from '~modules/auth/services/Auth.service';
import { User } from '~models';

describe('signIn.handler', () => {
  let req: Request;
  let res: jest.Mock;
  let next: jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();
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

  it('should call next whit a HttpException error when signIN service failed', async () => {
    req.setBody({ email: 'foo@asd.com', password: 'foo' });

    const mockSignInService = jest.fn().mockImplementation(() => {
      throw new HttpException(403, 'User not found');
    });
    AuthService.signIn = mockSignInService;

    await signInHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(nextCallArg).toHaveProperty<string>(
      'message',
      expect.stringMatching(/user not found/i)
    );
    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty('statusCode');
    expect(nextCallArg).toHaveProperty('message');
    expect(nextCallArg.statusCode).toBe(403);
    expect(nextCallArg.message).toMatch(/user not found/i);
  });

  it('should respond with status 200 and JWT authentication token', async () => {
    req.setBody({
      email: 'foo@asd.com',
      password: 'foo',
    });

    const res = new Response();

    const mockSignInService = jest
      .fn()
      .mockImplementation(() => 'authentication_token');

    AuthService.signIn = mockSignInService;

    await signInHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(next).not.toBeCalled();
    expect(mockSignInService).toBeCalledWith<[User]>({
      email: 'foo@asd.com',
      password: 'foo',
    });

    expect(res.json).toBeCalledWith({ authToken: 'authentication_token' });
    expect(res.statusCode).toBe<number>(200);

    res.resetMocked();
  });
});
