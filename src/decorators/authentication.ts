import { NextFunction, Request } from 'express';

import { HttpException } from '../common/HttpException';
import { AuthService } from '../services/Auth.service';

export function auth(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    const req = args[0] as Request;
    const next = args[2] as NextFunction;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new HttpException(403, 'Not authorized. Missing authentication header')
      );
    }

    const isValidToken = AuthService.validateAuthToken(authHeader);

    if (!isValidToken) {
      return next(new HttpException(403, 'Not authorized. Invalid token'));
    }

    original.apply(this, args);
  };
}
