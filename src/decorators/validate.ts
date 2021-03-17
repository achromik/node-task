import { NextFunction, Request } from 'express';
import Joi from 'joi';

import { HttpException } from '~common';

export function validate(schema: Joi.Schema) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const original = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const req = args[0] as Request;
      const next = args[2] as NextFunction;

      const { error } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        const errors: string[] = error.details.map((e) => e.message);

        return next(new HttpException(400, errors.join(',r ')));
      }
      original.apply(this, args);
    };
  };
}
