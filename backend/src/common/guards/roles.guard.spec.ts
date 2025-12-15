import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ADMIN_KEY } from '../decorators/admin.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any = null): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no admin requirement is set', () => {
      // Arrange
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should allow access for admin users when admin is required', () => {
      // Arrange
      const adminUser = {
        _id: 'admin123',
        email: 'admin@example.com',
        isAdmin: true,
      };
      const context = createMockExecutionContext(adminUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException for non-admin users when admin is required', () => {
      // Arrange
      const regularUser = {
        _id: 'user123',
        email: 'user@example.com',
        isAdmin: false,
      };
      const context = createMockExecutionContext(regularUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Not authorized as an admin',
      );
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      // Arrange
      const context = createMockExecutionContext(null);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user object is undefined', () => {
      // Arrange
      const context = createMockExecutionContext(undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when isAdmin is explicitly false', () => {
      // Arrange
      const nonAdminUser = {
        _id: 'user123',
        email: 'user@example.com',
        isAdmin: false,
      };
      const context = createMockExecutionContext(nonAdminUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when isAdmin is missing', () => {
      // Arrange
      const userWithoutAdminFlag = {
        _id: 'user123',
        email: 'user@example.com',
      };
      const context = createMockExecutionContext(userWithoutAdminFlag);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access when admin requirement is undefined', () => {
      // Arrange
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when admin requirement is null', () => {
      // Arrange
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should correctly read metadata from both handler and class', () => {
      // Arrange
      const context = createMockExecutionContext();
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(false);

      // Act
      guard.canActivate(context);

      // Assert
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should allow user with isAdmin = true as string (truthy value)', () => {
      // Arrange
      const userWithStringAdmin = {
        _id: 'user123',
        email: 'user@example.com',
        isAdmin: 'true' as any, // Some APIs might return string (truthy)
      };
      const context = createMockExecutionContext(userWithStringAdmin);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      // JavaScript truthy values: non-empty string is truthy, so this passes
      expect(result).toBe(true);
    });

    it('should allow admin user with additional properties', () => {
      // Arrange
      const adminUserWithExtra = {
        _id: 'admin123',
        email: 'admin@example.com',
        isAdmin: true,
        name: 'Admin User',
        role: 'superadmin',
      };
      const context = createMockExecutionContext(adminUserWithExtra);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('error messages', () => {
    it('should provide clear error message when access is denied', () => {
      // Arrange
      const regularUser = {
        _id: 'user123',
        email: 'user@example.com',
        isAdmin: false,
      };
      const context = createMockExecutionContext(regularUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act & Assert
      try {
        guard.canActivate(context);
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Not authorized as an admin');
      }
    });
  });
});

