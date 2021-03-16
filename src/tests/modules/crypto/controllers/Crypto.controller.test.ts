/* eslint-disable @typescript-eslint/no-explicit-any */
import { CryptoController } from '~modules/crypto/controllers';

jest.mock('express', () => {
  return require('jest-express');
});

describe('CryptoController', () => {
  let generateKeyPairSpy: jest.SpyInstance;
  let encryptSpy: jest.SpyInstance;

  beforeAll(() => {
    generateKeyPairSpy = jest.spyOn(
      CryptoController.prototype as any,
      '_generateKeyPair'
    );
    encryptSpy = jest.spyOn(CryptoController.prototype as any, '_encrypt');
  });

  afterAll(() => {
    generateKeyPairSpy.mockRestore();
    encryptSpy.mockRestore();
  });

  afterEach(() => {
    generateKeyPairSpy.mockClear();
    encryptSpy.mockClear();
  });

  it('should create instance with proper routes with passed base route', () => {
    const controller = new CryptoController('/foo');

    expect(controller.path).toBe('/foo');

    expect(controller.router.post).nthCalledWith(
      1,
      '/foo/generate-key-pair',
      generateKeyPairSpy
    );
    expect(controller.router.post).nthCalledWith(2, '/foo/encrypt', encryptSpy);
  });

  it('should create instance with proper routes with default base route', async () => {
    const controller = new CryptoController();

    expect(controller.path).toBe('');

    expect(controller.router.post).nthCalledWith(
      1,
      '/generate-key-pair',
      generateKeyPairSpy
    );
    expect(controller.router.post).nthCalledWith(2, '/encrypt', encryptSpy);
  });
});
