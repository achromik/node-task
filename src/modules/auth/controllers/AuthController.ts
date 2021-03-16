import express, { Router, Request, Response, NextFunction } from 'express';

import { Controller } from '~types';
import { signInHandler } from '../handlers';
import {
  encryptHandler,
  generateKeyPairHandler,
} from '~modules/crypto/handlers';

import { auth } from '~decorators';

export class AuthController implements Controller {
  #authPath: string;
  #router: Router;

  get path(): string {
    return this.#authPath;
  }

  get router(): Router {
    return this.#router;
  }

  constructor(path = '') {
    this.#router = express.Router();
    this.#authPath = path;
    this._initializeRoutes();
  }

  private _initializeRoutes() {
    this.#router.post(this._preparePath('sign-in'), this._signIn);
    this.#router.post(
      this._preparePath('generate-key-pair'),
      this._generateKeyPair
    );
    this.#router.post(this._preparePath('encrypt'), this._encrypt);
  }

  private _preparePath(path: string): string {
    return `${this.#authPath}/${path}`;
  }

  private _signIn(req: Request, res: Response, next: NextFunction): void {
    signInHandler(req, res, next);
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
