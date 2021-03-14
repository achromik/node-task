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

    const payload = AuthService.validateAuthToken(authHeader);

    if (!payload) {
      return next(new HttpException(403, 'Not authorized. Invalid token'));
    }

    req.user = payload;

    original.apply(this, args);
  };
}
