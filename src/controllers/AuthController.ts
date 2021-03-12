import express, { Router } from 'express';

import { Controller } from '../types';
import {
  encryptHandler,
  generateKeyPairHandler,
  signInHandler,
} from '../handlers/auth';

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
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.#router.post(this.preparePath('sign-in'), signInHandler);
    this.#router.post(
      this.preparePath('generate-key-pair'),
      generateKeyPairHandler
    );
    this.#router.post(this.preparePath('encrypt'), encryptHandler);
  }

  private preparePath(path: string): string {
    return `${this.#authPath}/${path}`;
  }
}
