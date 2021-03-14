import express from 'express';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { signInHandler } from '../../../handlers/auth';
import { HttpException } from '../../../common/HttpException';
import { UserService } from '../../../services/User.service';
import { AuthService } from '../../../services/Auth.service';

jest.mock('../../../services/User.service');
jest.mock('../../../services/Auth.service');

describe('signIn.handler', () => {
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

  it('should call next whit a HttpException error when user email is missing', async () => {
    req.setBody({ password: 'asd' });

    await signInHandler(
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
    expect(nextCallArg.statusCode).toBe(400);
    expect(nextCallArg.message).toMatch(/missing.*email/i);
  });

  it('should call next whit a HttpException error when user password is missing', async () => {
    req.setBody({ email: 'foo@asd.com' });

    await signInHandler(
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
    expect(nextCallArg.statusCode).toBe(400);
    expect(nextCallArg.message).toMatch(/missing.*password/i);
  });

  it('should call next with a HttpException error when passed user does not exist', async () => {
    req.setBody({
      email: 'foo@asd.com',
      password: 'foo',
    });

    const mockGetUserByEmail = jest.fn().mockReturnValue(undefined);
    UserService.getUserByEmail = mockGetUserByEmail;

    await signInHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockGetUserByEmail).toBeCalledWith('foo@asd.com');

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty('statusCode');
    expect(nextCallArg).toHaveProperty('message');
    expect(nextCallArg.statusCode).toBe(403);
    expect(nextCallArg.message).toMatch(/invalid user/i);
  });

  it('should call next with a HttpException error when passed password was invalid', async () => {
    req.setBody({
      email: 'foo@asd.com',
      password: 'foo',
    });

    const mockGetUserByEmail = jest.fn().mockReturnValue({
      email: 'foo@asd.com',
      password: 'hashed_foo',
    });
    UserService.getUserByEmail = mockGetUserByEmail;

    const mockValidatePassword = jest.fn().mockResolvedValue(false);
    AuthService.validatePassword = mockValidatePassword;

    await signInHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    const nextCallArg = next.mock.calls[0][0];
    expect(next).toBeCalledTimes(1);
    expect(res).not.toBeCalled();
    expect(mockGetUserByEmail).toBeCalledWith('foo@asd.com');
    expect(mockValidatePassword).toBeCalledWith('foo', 'hashed_foo');

    expect(nextCallArg).toBeInstanceOf(HttpException);
    expect(nextCallArg).toHaveProperty('statusCode');
    expect(nextCallArg).toHaveProperty('message');
    expect(nextCallArg.statusCode).toBe(401);
    expect(nextCallArg.message).toMatch(/not authenticated/i);
  });

  it('should respond with status 200 and JWT authentication token', async () => {
    req.setBody({
      email: 'foo@asd.com',
      password: 'foo',
    });

    const res = new Response();

    const mockGetUserByEmail = jest.fn().mockReturnValue({
      email: 'foo@asd.com',
      password: 'hashed_foo',
    });
    UserService.getUserByEmail = mockGetUserByEmail;

    const mockValidatePassword = jest.fn().mockResolvedValue(true);
    AuthService.validatePassword = mockValidatePassword;

    const mockGenerateAuthToken = jest
      .fn()
      .mockReturnValue('authentication_token');
    AuthService.generateAuthToken = mockGenerateAuthToken;

    await signInHandler(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(next).not.toBeCalled();
    expect(mockGetUserByEmail).toBeCalledWith('foo@asd.com');
    expect(mockValidatePassword).toBeCalledWith('foo', 'hashed_foo');
    expect(mockGenerateAuthToken).toBeCalledWith('foo@asd.com');

    expect(res.json).toBeCalledWith({ authToken: 'authentication_token' });
    expect(res.statusCode).toBe(200);

    res.resetMocked();
  });
});
