import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

describe('GroupsService', () => {
  let service: GroupsService;
  let mockGroupModel: any;

  const mockGroup = {
    _id: 'group123',
    name: 'Test Group',
    description: 'Test description',
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
    MockModel.countDocuments = jest.fn();

    mockGroupModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group.name),
          useValue: mockGroupModel,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated groups', async () => {
      const groups = [mockGroup, mockGroup];
      mockGroupModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(groups),
      });
      mockGroupModel.countDocuments.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result).toEqual({
        groups,
        page: 1,
        pages: 1,
      });
      expect(mockGroupModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by keyword', async () => {
      mockGroupModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockGroup]),
      });
      mockGroupModel.countDocuments.mockResolvedValue(1);

      await service.findAll(1, 'test');

      expect(mockGroupModel.find).toHaveBeenCalledWith({
        name: { $regex: 'test', $options: 'i' },
      });
    });

    it('should handle pagination', async () => {
      mockGroupModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockGroup]),
      });
      mockGroupModel.countDocuments.mockResolvedValue(25);

      const result = await service.findAll(2);

      expect(result.page).toBe(2);
      expect(result.pages).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return a group by id', async () => {
      mockGroupModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGroup),
      });

      const result = await service.findById('group123');

      expect(result).toEqual(mockGroup);
      expect(mockGroupModel.findById).toHaveBeenCalledWith('group123');
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new group', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'New Group',
        description: 'New description',
      };

      await service.create(createGroupDto);

      expect(mockGroupModel).toHaveBeenCalledWith(createGroupDto);
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const updateDto: UpdateGroupDto = {
        name: 'Updated Group',
      };

      const groupWithSave = {
        ...mockGroup,
        save: jest.fn().mockResolvedValue({ ...mockGroup, ...updateDto }),
      };

      mockGroupModel.findById.mockResolvedValue(groupWithSave);

      const result = await service.update('group123', updateDto);

      expect(groupWithSave.name).toBe('Updated Group');
      expect(groupWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a group', async () => {
      const groupWithDelete = {
        ...mockGroup,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockGroupModel.findById.mockResolvedValue(groupWithDelete);

      const result = await service.remove('group123');

      expect(result).toEqual({ message: 'Group removed' });
      expect(groupWithDelete.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

