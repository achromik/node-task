import { verifyRequiredEnvs } from '../verifyEnvs';

describe('verifyRequiredEnvs()', () => {
  const OLD_ENV = process.env;
  const originalError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };

    console.error = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = originalError;
  });

  it('should run with no exit code when all required envs are set', () => {
    process.env.TEST = 'test';

    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    verifyRequiredEnvs(['TEST']);

    expect(mockExit).toHaveBeenCalledTimes(0);

    mockExit.mockRestore();
  });

  it('should exit with exit code equal 1 when required env is missing', () => {
    process.env.TEST = 'test';

    const mockExit = jest.spyOn(process, 'exit').mockImplementation();

    verifyRequiredEnvs(['TEST', 'FOO']);

    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
  });
});
