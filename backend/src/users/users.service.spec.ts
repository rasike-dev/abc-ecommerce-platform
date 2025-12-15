import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    isAdmin: false,
    save: jest.fn().mockResolvedValue(this),
    deleteOne: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const MockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new123' }),
    }));

    MockModel.find = jest.fn();
    MockModel.findById = jest.fn();
    MockModel.findOne = jest.fn();

    mockUserModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      await service.create(createUserDto);

      expect(mockUserModel).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [mockUser, mockUser];
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(users),
      });

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id without password', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('user123');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdWithPassword', () => {
    it('should return a user by id with password', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByIdWithPassword('user123');

      expect(result).toEqual(mockUser);
      expect(mockUser.password).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByIdWithPassword('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const userWithSave = {
        ...mockUser,
        save: jest.fn().mockResolvedValue({ ...mockUser, ...updateDto }),
      };

      mockUserModel.findById.mockResolvedValueOnce(userWithSave);
      mockUserModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateDto }),
      });

      const result = await service.update('user123', updateDto);

      expect(userWithSave.name).toBe('Updated Name');
      expect(userWithSave.email).toBe('updated@example.com');
      expect(userWithSave.save).toHaveBeenCalled();
    });

    it('should update password if provided', async () => {
      const updateDto = {
        password: 'newpassword123',
      };

      const userWithSave = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      mockUserModel.findById.mockResolvedValueOnce(userWithSave);
      mockUserModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.update('user123', updateDto);

      expect(userWithSave.password).toBe('newpassword123');
      expect(userWithSave.save).toHaveBeenCalled();
    });

    it('should not update password if empty string', async () => {
      const updateDto = {
        password: '   ',
      };

      const userWithSave = {
        ...mockUser,
        password: 'original_password',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      mockUserModel.findById.mockResolvedValueOnce(userWithSave);
      mockUserModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.update('user123', updateDto);

      expect(userWithSave.password).toBe('original_password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userWithDelete = {
        ...mockUser,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findById.mockResolvedValue(userWithDelete);

      const result = await service.remove('user123');

      expect(result).toEqual({ message: 'User removed' });
      expect(userWithDelete.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

