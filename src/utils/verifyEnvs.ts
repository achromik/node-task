import 'dotenv/config';

export const verifyRequiredEnvs: (envs: string[]) => void = (envs) => {
  const requiredEnv: string[] = envs;
  const unsetEnv: string[] = requiredEnv.filter(
    (env) => !(typeof process.env[env] !== 'undefined' && process.env[env])
  );

  if (unsetEnv.length) {
    console.error(
      'Required ENV variables are not set: [' + unsetEnv.join(', ') + ']'
    );

    process.exit(1);
  }
};
