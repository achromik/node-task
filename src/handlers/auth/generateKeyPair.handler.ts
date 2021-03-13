import { NextFunction, Request, Response } from 'express';

export function generateKeyPairHandler(
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(501).send('Not implemented');
}
