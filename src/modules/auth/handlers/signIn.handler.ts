import { NextFunction, Request, Response } from 'express';

import { AuthService } from '~modules/auth/services/Auth.service';
import { UserDocument } from '~models';

export async function signInHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password }: UserDocument = req.body;

    const authToken = await AuthService.signIn({ email, password });

    res.status(200).json({ authToken });
  } catch (err) {
    return next(err);
  }
}
