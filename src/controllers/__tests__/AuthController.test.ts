const originalExpress = jest.requireActual('express');
let router = originalExpress.Router();
const postSpy = jest.fn();

jest.doMock('express', () => {
  return {
    ...originalExpress,
    Router: () => ({
      ...router,
      post: postSpy.mockImplementation((...args: unknown[]) =>
        router.post(...args)
      ),
    }),
  };
});

import { AuthController } from '../';

describe('AuthController', () => {
  beforeEach(() => {
    router = originalExpress.Router();
    jest.clearAllMocks();
  });

  it('should create instance with proper routes with passed base route', () => {
    const auth = new AuthController('/foo');

    expect(auth.path).toBe('/foo');

    expect(auth.router.stack.length).toBe(3);

    expect(auth.router.stack[0].route.path).toBe('/foo/sign-in');
    expect(auth.router.stack[1].route.path).toBe('/foo/generate-key-pair');
    expect(auth.router.stack[2].route.path).toBe('/foo/encrypt');

    expect(postSpy).toBeCalledTimes(3);

    expect(postSpy.mock.calls[0][0]).toBe('/foo/sign-in');
    expect(postSpy.mock.calls[0][1]).toBeInstanceOf(Function);

    expect(postSpy.mock.calls[1][0]).toBe('/foo/generate-key-pair');
    expect(postSpy.mock.calls[1][1]).toBeInstanceOf(Function);

    expect(postSpy.mock.calls[2][0]).toBe('/foo/encrypt');
    expect(postSpy.mock.calls[2][1]).toBeInstanceOf(Function);
  });

  it('should create instance with proper routes with default base route', () => {
    const auth = new AuthController();

    expect(auth.path).toBe('');

    expect(auth.router.stack.length).toBe(3);

    expect(auth.router.stack[0].route.path).toBe('/sign-in');
    expect(auth.router.stack[1].route.path).toBe('/generate-key-pair');
    expect(auth.router.stack[2].route.path).toBe('/encrypt');

    expect(postSpy).toBeCalledTimes(3);

    expect(postSpy.mock.calls[0][0]).toBe('/sign-in');
    expect(postSpy.mock.calls[0][1]).toBeInstanceOf(Function);

    expect(postSpy.mock.calls[1][0]).toBe('/generate-key-pair');
    expect(postSpy.mock.calls[1][1]).toBeInstanceOf(Function);

    expect(postSpy.mock.calls[2][0]).toBe('/encrypt');
    expect(postSpy.mock.calls[2][1]).toBeInstanceOf(Function);
  });
});
