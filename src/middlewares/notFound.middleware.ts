import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  const message = 'Resource not found';

  response.status(404).json({ error: message });
};
