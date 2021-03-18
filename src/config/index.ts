export const config = {
  PORT: parseInt(process.env.PORT as string, 10) || 3000,
  API_BASE: process.env.API_BASE || '/api',
  JWT_TTL: process.env.JWT_TTL || '5m',
  JWT_SECRET: process.env.JWT_SECRET || '',
  DB_NAME: process.env.DB_NAME || '',
  rsaProps: {
    options: {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    },
  },
  filePath: './data/files/sample.pdf',
};
