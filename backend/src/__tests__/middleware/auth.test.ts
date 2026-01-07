import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { config } from '../../config';
import { generateToken } from '../helpers/testUtils';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should call next() with valid token', () => {
      const token = generateToken(1, 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe(1);
      expect(mockRequest.user?.email).toBe('test@example.com');
    });

    it('should return 401 when no token provided', () => {
      mockRequest.headers = {};

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is malformed', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 with expired token', (done) => {
      const expiredToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        config.jwtSecret,
        { expiresIn: '-1s' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
      done();
    });

    it('should return 403 with token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${wrongSecretToken}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should extract userId and email from valid token', () => {
      const userId = 42;
      const email = 'user42@example.com';
      const token = generateToken(userId, email);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user?.userId).toBe(userId);
      expect(mockRequest.user?.email).toBe(email);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
