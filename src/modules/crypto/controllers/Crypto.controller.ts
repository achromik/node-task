import { Router, Request, Response, NextFunction } from 'express';

import { ControllerInterface } from '~types';
import { encryptHandler, generateKeyPairHandler } from '../handlers';
import { auth } from '~decorators';

export class CryptoController implements ControllerInterface {
  #path: string;
  #router: Router;

  get path(): string {
    return this.#path;
  }

  get router(): Router {
    return this.#router;
  }

  constructor(path = '') {
    this.#router = Router();
    this.#path = path;
    this._initializeRoutes();
  }

  private _initializeRoutes() {
    this.#router.post(
      this._preparePath('generate-key-pair'),
      this._generateKeyPair
    );
    this.#router.post(this._preparePath('encrypt'), this._encrypt);
  }

  private _preparePath(path: string): string {
    return `${this.#path}/${path}`;
  }

  /* istanbul ignore next: decorator coverage issue */
  @auth
  private _generateKeyPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    generateKeyPairHandler(req, res, next);
  }

  /* istanbul ignore next: decorator coverage issue */
  @auth
  private _encrypt(req: Request, res: Response, next: NextFunction): void {
    encryptHandler(req, res, next);
  }
}
