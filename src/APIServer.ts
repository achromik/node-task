import * as http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from './middlewares';
import { APIServerConfig, Controller } from './types';

export class APIServer {
  readonly #app: Express;
  #path: string;

  get app(): Express {
    return this.#app;
  }

  #server!: http.Server;

  get server(): http.Server {
    return this.#server;
  }

  constructor(
    controllers: Controller[],
    { port = 3000, path = '/api' }: APIServerConfig
  ) {
    this.#app = express();
    this.#path = path;
    this.#app.set('port', port);
    this.configureMiddleware();
    this.initializeControllers(path, controllers);
    this.addErrorAndNotFoundMiddleware();
  }

  private configureMiddleware() {
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));

    this.#app.use(
      cors({
        origin: '*',
        credentials: true,
        methods: 'GET,HEAD,OPTIONS,POST,PUT',
        allowedHeaders: [
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Headers',
          'Origin',
          'Accept',
          'X-Requested-With',
          'Content-Type',
          'Access-Control-Request-Method',
          'Access-Control-Request-Headers',
          'Authorization',
        ],
      })
    );

    this.#app.use(helmet());
  }

  private initializeControllers(apiUrl: string, controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.#app.use(apiUrl, controller.router);
    });
  }

  public addErrorAndNotFoundMiddleware(): void {
    this.#app.use(errorHandler);
    this.#app.use(notFoundHandler);
  }

  public start(): void {
    this.#server = this.#app.listen(this.#app.get('port'), () => {
      console.log(
        `Server is running on port ${this.#app.get('port')}\nAPI base url is: ${
          this.#path
        }`
      );
    });
  }

  public close(): void {
    this.#server.close(() => {
      console.log('Server is down!');
    });
  }
}
