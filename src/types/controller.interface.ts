import { Router } from 'express';

export interface ControllerInterface {
  router: Router;
  path: string;
}
