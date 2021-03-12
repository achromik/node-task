import { Request, Response, NextFunction } from 'express';

import { notFoundHandler } from '../';

describe('notFoundHandler middleware', () => {
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

  it('should response with status code 404 and error message "Resource not found"', () => {
    const expectedOutput = {
      error: 'Resource not found',
    };

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toBeCalledWith(expectedOutput);
    expect(mockResponse.status).toBeCalledWith(404);
    expect(nextFunction).not.toBeCalled();
  });
});
