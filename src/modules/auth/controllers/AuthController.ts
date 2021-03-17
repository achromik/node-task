import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '~decorators';

import { ControllerInterface } from '~types';
import { signInHandler } from '../handlers';
import { signInSchema } from '../schema';

export class AuthController implements ControllerInterface {
  #path: string;
  #router: Router;

  constructor(path = '') {
    this.#router = Router();
    this.#path = path;
    this._initializeRoutes();
  }

  get path(): string {
    return this.#path;
  }

  get router(): Router {
    return this.#router;
  }

  private _initializeRoutes(): void {
    this.#router.post(this._preparePath('sign-in'), this._signIn);
  }

  private _preparePath(path: string): string {
    return `${this.#path}/${path}`;
  }

  @validate(signInSchema)
  private _signIn(req: Request, res: Response, next: NextFunction): void {
    signInHandler(req, res, next);
  }
}
