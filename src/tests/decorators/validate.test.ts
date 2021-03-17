import express from 'express';
import Joi from 'joi';
import { Request } from 'jest-express/lib/request';

import { validate } from '~decorators';
import { HttpException } from '~common';

const mockSchema = Joi.object({ foo: Joi.string().required() });
const mockFunction = jest
  .fn<boolean, unknown[]>()
  .mockImplementation(() => true);

class TestClass {
  @validate(mockSchema)
  static mockMethod(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    mockFunction(req, res, next);
  }
}

describe('validate decorator', () => {
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

  it('should call next with HttpException when validation fails', () => {
    req.setBody({ foo: 123 });

    TestClass.mockMethod(
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
      expect.stringMatching(/foo.*must.*string/i)
    );

    expect(mockFunction).not.toBeCalled();
  });

  it('should call decorated method when validation pass', () => {
    req.setBody({ foo: 'fooBar' });

    TestClass.mockMethod(
      (req as unknown) as express.Request,
      (res as unknown) as express.Response,
      next
    );

    expect(next).not.toBeCalled();

    expect(mockFunction).toBeCalledTimes(1);
    expect(mockFunction).toBeCalledWith<[Request, jest.Mock, jest.Mock]>(
      req,
      res,
      next
    );
    expect(mockFunction).toHaveReturnedWith<boolean>(true);
  });
});
