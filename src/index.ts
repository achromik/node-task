import { AuthController } from './controllers';
import { APIServer } from './APIServer';
import { verifyRequiredEnvs } from './utils/verifyEnvs';

verifyRequiredEnvs(['PORT', 'API_BASE_URL']);

const server = new APIServer([new AuthController()], {
  port: parseInt(process.env.PORT as string, 10),
  path: process.env.API_BASE_PATH,
});

server.start();

type ModuleId = string | number;

interface WebpackHotModule {
  hot?: {
    data: unknown;
    accept(
      dependencies: string[],
      callback?: (updatedDependencies: ModuleId[]) => void
    ): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: unknown) => void): void;
  };
}

declare const module: WebpackHotModule;

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.close());
}
