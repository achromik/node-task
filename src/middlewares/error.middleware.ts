import { Request, Response, NextFunction } from 'express';

import { HttpException } from '../common/HttpException';

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  const status: number = error.statusCode || 500;
  const message =
    error.message || "It's not you. It's us. We are having some problems.";

  response.status(status).json({ error: message });
};
