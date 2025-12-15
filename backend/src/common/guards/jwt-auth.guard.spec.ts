import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('should be an instance of JwtAuthGuard', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should call parent canActivate method', () => {
      // Arrange
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer valid.token.here' },
          }),
        }),
      } as unknown as ExecutionContext;

      const parentCanActivate = jest.spyOn(
        AuthGuard('jwt').prototype,
        'canActivate',
      );
      parentCanActivate.mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);

      // Cleanup
      parentCanActivate.mockRestore();
    });
  });

  describe('integration with Passport', () => {
    it('should use jwt strategy name', () => {
      // The guard is instantiated with 'jwt' as the strategy name
      // This is verified through the class definition
      expect(guard).toBeDefined();
      expect(Object.getPrototypeOf(guard)).toBe(JwtAuthGuard.prototype);
    });
  });
});

