import { AuthService } from '../Auth.service';
import bcrypt from 'bcrypt';
import JWT, { JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../../config';
import { UserService } from '../User.service';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('validatePassword', () => {
    let mockCompare: jest.Mock;

    beforeEach(() => {
      mockCompare = jest.fn();
    });

    afterEach(() => {
      mockCompare.mockRestore();
    });

    it("should return false if password does not match password's hash", async () => {
      mockCompare.mockResolvedValue(false);
      bcrypt.compare = mockCompare;

      const result = await AuthService.validatePassword(
        'password',
        'hashed-password'
      );

      expect(result).toBe<boolean>(false);
      expect(mockCompare).toBeCalledWith<[string, string]>(
        'password',
        'hashed-password'
      );
    });

    it("should return true if password match password's hash", async () => {
      mockCompare.mockResolvedValue(true);
      bcrypt.compare = mockCompare;

      const result = await AuthService.validatePassword(
        'password',
        'hashed-password'
      );

      expect(result).toBe<boolean>(true);
      expect(mockCompare).toBeCalledWith<[string, string]>(
        'password',
        'hashed-password'
      );
    });
  });

  describe('validateAuthToken', () => {
    let mockJwtVerify: jest.Mock;

    beforeEach(() => {
      mockJwtVerify = jest.fn();
    });

    afterEach(() => {
      mockJwtVerify.mockRestore();
    });

    it('should return false when no authHeader passed', () => {
      mockJwtVerify.mockImplementation(() => {
        throw new JsonWebTokenError('invalid token');
      });

      JWT.verify = mockJwtVerify;

      const result = AuthService.validateAuthToken();

      expect(result).toBe<boolean>(false);
      expect(mockJwtVerify).toBeCalledWith<[string, string]>(
        '',
        config.JWT_SECRET
      );
    });

    it('should return false when authHeader has invalid token', () => {
      mockJwtVerify.mockImplementation(() => {
        throw new JsonWebTokenError('invalid token');
      });

      JWT.verify = mockJwtVerify;

      const result = AuthService.validateAuthToken('Bearer invalid_jwt_token');

      expect(result).toBe<boolean>(false);
      expect(mockJwtVerify).toBeCalledWith<[string, string]>(
        'invalid_jwt_token',
        config.JWT_SECRET
      );
    });

    it('should return false when no matching user found', () => {
      const mockGetUseByEmail = jest.fn().mockReturnValue(undefined);

      UserService.getUserByEmail = mockGetUseByEmail;

      mockJwtVerify.mockReturnValue({ email: 'foo@mail.com' });

      JWT.verify = mockJwtVerify;

      const result = AuthService.validateAuthToken('Bearer jwt_string');

      expect(result).toBe<boolean>(false);
      expect(mockJwtVerify).toBeCalledWith<[string, string]>(
        'jwt_string',
        config.JWT_SECRET
      );
      expect(mockGetUseByEmail).toBeCalledWith<[string]>('foo@mail.com');
    });

    it('should return true when authToken is valid', () => {
      const mockGetUseByEmail = jest.fn().mockReturnValue({
        email: 'foo@mail.com',
        password: 'hashed_password',
      });

      UserService.getUserByEmail = mockGetUseByEmail;

      mockJwtVerify.mockReturnValue({ email: 'foo@mail.com' });

      JWT.verify = mockJwtVerify;

      const result = AuthService.validateAuthToken('Bearer jwt_string');

      expect(result).toBe<boolean>(true);
      expect(mockJwtVerify).toBeCalledWith<[string, string]>(
        'jwt_string',
        config.JWT_SECRET
      );
      expect(mockGetUseByEmail).toBeCalledWith<[string]>('foo@mail.com');
    });
  });

  describe('generateAuthToken', () => {
    let mockJwtSign: jest.Mock;

    beforeEach(() => {
      mockJwtSign = jest.fn();
    });

    afterEach(() => {
      mockJwtSign.mockRestore();
    });

    it('should return generated token ', () => {
      const expectedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG1haWwuY29tIiwiaWF0IjoxNjE1NjQ1MTMzLCJleHAiOjE2MTU2NDUxNjN9.3XxWd0KsoS6cdDela6agW9h55dixSE35rznxSBkUlnw';
      mockJwtSign.mockReturnValue(expectedToken);

      JWT.sign = mockJwtSign;

      const result = AuthService.generateAuthToken('admin@mail.com');

      expect(result).toBe(expectedToken);
      expect(mockJwtSign).toBeCalledWith<
        [{ email: string }, JWT.Secret, JWT.SignOptions]
      >({ email: 'admin@mail.com' }, config.JWT_SECRET, {
        expiresIn: config.JWT_TTL,
      });
    });
  });
});
