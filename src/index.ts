import 'dotenv/config';

import { AuthController } from '~modules/auth/controllers';
import { CryptoController } from '~modules/crypto/controllers';
import { APIServer } from './APIServer';
import { config } from '~config';
import { verifyRequiredEnvs } from '~utils';
import { MongoDatabase } from './database/mongo';

declare const module: WebpackHotModule;

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

verifyRequiredEnvs(['JWT_SECRET', 'DB_NAME']);

(async () => {
  await MongoDatabase.connect(`mongodb://localhost:27017/${config.DB_NAME}`);

  const server = new APIServer([new AuthController(), new CryptoController()], {
    port: config.PORT,
    path: config.API_BASE,
  });

  server.start();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }
})();
