import 'dotenv/config';

import * as path from 'path';
import { Seeder } from 'mongo-seeding';

import { verifyRequiredEnvs } from '~utils';

verifyRequiredEnvs(['DB_NAME']);

const config = {
  database: {
    host: '127.0.0.1',
    port: 27017,
    name: process.env.DB_NAME,
  },
  dropDatabase: true,
};
const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  path.resolve('./seed-data/'),
  {
    extensions: ['ts'],
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
  }
);

seeder
  .import(collections)
  .then(() => {
    console.log('Success');
  })
  .catch((err: Error) => {
    console.log('Error', err);
  });
