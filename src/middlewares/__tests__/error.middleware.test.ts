import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../../common/HttpException';

import { errorHandler } from '../';

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    const resJson = jest.fn();
    const resStatus = jest.fn();

    mockRequest = {};
    mockResponse = {
      json: resJson,
      status: resStatus,
    };

    resJson.mockImplementation(() => mockResponse);
    resStatus.mockImplementation(() => mockResponse);
  });

  it('should response with status code 500 and with default message', () => {
    const expectedOutput = {
      error: "It's not you. It's us. We are having some problems.",
    };

    const error: Partial<HttpException> = {};

    errorHandler(
      error as HttpException,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toBeCalledWith(expectedOutput);
    expect(mockResponse.status).toBeCalledWith(500);
    expect(nextFunction).not.toBeCalled();
  });

  it('should response with passed status code and message', () => {
    const expectedOutput = {
      error: 'Mock message',
    };

    const error = new HttpException(501, 'Mock message');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toBeCalledWith(expectedOutput);
    expect(mockResponse.status).toBeCalledWith(501);
    expect(nextFunction).not.toBeCalled();
  });
});
