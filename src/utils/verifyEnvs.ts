import 'dotenv/config';

export const verifyRequiredEnvs: (envs: string[]) => void = (envs) => {
  const requiredEnv: string[] = envs;
  const unsetEnv: string[] = requiredEnv.filter(
    (env) => !(typeof process.env[env] !== 'undefined' && process.env[env])
  );

  if (unsetEnv.length) {
    console.error(
      '\n\nPLEASE add followed variables to .env file',
      `\nRequired ENV variables are not set: [${unsetEnv.join(', ')}]\n\n`
    );

    process.exit(1);
  }
};
