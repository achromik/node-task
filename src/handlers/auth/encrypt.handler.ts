import { Request, Response } from 'express';

export function encryptHandler(_req: Request, res: Response): void {
  res.status(501).send('Not implemented');
}
