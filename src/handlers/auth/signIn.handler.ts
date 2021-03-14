import { NextFunction, Request, Response } from 'express';

import { HttpException } from '../../common/HttpException';
import { UserService } from '../../services/User.service';
import { AuthService } from '../../services/Auth.service';

export async function signInHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpException(400, 'Missing email or password');
    }

    const user = UserService.getUserByEmail(email);

    if (!user) {
      throw new HttpException(403, 'Invalid user');
    }

    const isValid = await AuthService.validatePassword(password, user.password);

    if (!isValid) {
      throw new HttpException(401, 'Not authenticated');
    }

    const authToken = AuthService.generateAuthToken(email);

    res.status(200).json({ authToken });
  } catch (err) {
    return next(err);
  }
}
