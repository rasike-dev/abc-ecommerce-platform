import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: GroupsService;

  const mockGroupsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockGroup = {
    _id: 'group123',
    name: 'Test Group',
    description: 'Test description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    groupsService = module.get<GroupsService>(GroupsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /groups', () => {
    it('should return paginated groups', async () => {
      const expectedResponse = {
        groups: [mockGroup],
        page: 1,
        pages: 1,
      };
      mockGroupsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(groupsService.findAll).toHaveBeenCalled();
    });

    it('should pass query parameters to service', async () => {
      mockGroupsService.findAll.mockResolvedValue({
        groups: [],
        page: 1,
        pages: 1,
      });

      await controller.findAll(2, 'test');

      expect(groupsService.findAll).toHaveBeenCalledWith(2, 'test');
    });
  });

  describe('GET /groups/:id', () => {
    it('should return a group by id', async () => {
      mockGroupsService.findById.mockResolvedValue(mockGroup);

      const result = await controller.findOne('group123');

      expect(result).toEqual(mockGroup);
      expect(groupsService.findById).toHaveBeenCalledWith('group123');
    });
  });

  describe('POST /groups', () => {
    it('should create a new group', async () => {
      const createDto: CreateGroupDto = {
        name: 'New Group',
        description: 'New description',
      };

      mockGroupsService.create.mockResolvedValue(mockGroup);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockGroup);
      expect(groupsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /groups/:id', () => {
    it('should update a group', async () => {
      const updateDto: UpdateGroupDto = {
        name: 'Updated Group',
      };
      const updatedGroup = { ...mockGroup, ...updateDto };

      mockGroupsService.update.mockResolvedValue(updatedGroup);

      const result = await controller.update('group123', updateDto);

      expect(result).toEqual(updatedGroup);
      expect(groupsService.update).toHaveBeenCalledWith('group123', updateDto);
    });
  });

  describe('DELETE /groups/:id', () => {
    it('should delete a group', async () => {
      mockGroupsService.remove.mockResolvedValue({ message: 'Group removed' });

      const result = await controller.remove('group123');

      expect(result).toEqual({ message: 'Group removed' });
      expect(groupsService.remove).toHaveBeenCalledWith('group123');
    });
  });
});

