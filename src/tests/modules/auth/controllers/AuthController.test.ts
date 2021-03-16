/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthController } from '../../../../modules/auth/controllers';

jest.mock('express', () => {
  return require('jest-express');
});

describe('AuthController', () => {
  let signInSpy: jest.SpyInstance;
  let generateKeyPairSpy: jest.SpyInstance;
  let encryptSpy: jest.SpyInstance;

  beforeAll(() => {
    signInSpy = jest.spyOn(AuthController.prototype as any, '_signIn');
    generateKeyPairSpy = jest.spyOn(
      AuthController.prototype as any,
      '_generateKeyPair'
    );
    encryptSpy = jest.spyOn(AuthController.prototype as any, '_encrypt');
  });

  afterAll(() => {
    signInSpy.mockRestore();
    generateKeyPairSpy.mockRestore();
    encryptSpy.mockRestore();
  });

  afterEach(() => {
    signInSpy.mockClear();
    generateKeyPairSpy.mockClear();
    encryptSpy.mockClear();
  });

  it('should create instance with proper routes with passed base route', () => {
    const auth = new AuthController('/foo');

    expect(auth.path).toBe('/foo');

    expect(auth.router.post).nthCalledWith(1, '/foo/sign-in', signInSpy);
    expect(auth.router.post).nthCalledWith(
      2,
      '/foo/generate-key-pair',
      generateKeyPairSpy
    );
    expect(auth.router.post).nthCalledWith(3, '/foo/encrypt', encryptSpy);
  });

  it('should create instance with proper routes with default base route', async () => {
    const auth = new AuthController();

    expect(auth.path).toBe('');

    expect(auth.router.post).nthCalledWith(1, '/sign-in', signInSpy);
    expect(auth.router.post).nthCalledWith(
      2,
      '/generate-key-pair',
      generateKeyPairSpy
    );
    expect(auth.router.post).nthCalledWith(3, '/encrypt', encryptSpy);
  });
});
