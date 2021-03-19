import { NextFunction, Request } from 'express';

import { HttpException } from '~common';
import { AuthService } from '~modules/auth/services/Auth.service';

export function auth(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const req = args[0] as Request;
    const next = args[2] as NextFunction;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new HttpException(403, 'Not authorized. Missing authentication header')
      );
    }

    const payload = await AuthService.validateAuthToken(authHeader);

    if (!payload) {
      return next(new HttpException(403, 'Not authorized. Invalid token'));
    }

    req.user = payload;

    original.call(this, req, args[1], next);
  };
}
