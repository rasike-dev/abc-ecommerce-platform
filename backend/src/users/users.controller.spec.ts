import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users', () => {
    it('should return all users (admin)', async () => {
      const users = [mockUser, mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /users/profile', () => {
    it('should return user profile', async () => {
      const user = { _id: 'user123' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(user);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(user._id);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', async () => {
      const user = { _id: 'user123' };
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(user, updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(user._id, updateDto);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id (admin)', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user123');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user123');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user (admin)', async () => {
      const updateDto = {
        name: 'Updated Name',
        isAdmin: true,
      };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user123', updateDto);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user (admin)', async () => {
      mockUsersService.remove.mockResolvedValue({ message: 'User removed' });

      const result = await controller.remove('user123');

      expect(result).toEqual({ message: 'User removed' });
      expect(usersService.remove).toHaveBeenCalledWith('user123');
    });
  });
});

