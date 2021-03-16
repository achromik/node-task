/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthController } from '~modules/auth/controllers';

jest.mock('express', () => {
  return require('jest-express');
});

describe('AuthController', () => {
  let signInSpy: jest.SpyInstance;

  beforeAll(() => {
    signInSpy = jest.spyOn(AuthController.prototype as any, '_signIn');
  });

  afterAll(() => {
    signInSpy.mockRestore();
  });

  afterEach(() => {
    signInSpy.mockClear();
  });

  it('should create instance with proper routes with passed base route', () => {
    const controller = new AuthController('/foo');

    expect(controller.path).toBe('/foo');

    expect(controller.router.post).nthCalledWith(1, '/foo/sign-in', signInSpy);
  });

  it('should create instance with proper routes with default base route', async () => {
    const controller = new AuthController();

    expect(controller.path).toBe('');

    expect(controller.router.post).nthCalledWith(1, '/sign-in', signInSpy);
  });
});
