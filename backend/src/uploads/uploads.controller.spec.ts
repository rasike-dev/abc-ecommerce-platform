import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let uploadsService: UploadsService;

  const mockUploadsService = {
    getUploadedFilePath: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /uploads', () => {
    it('should return uploaded file path', () => {
      const mockFile = {
        path: 'uploads/test-image-1234567890.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        fieldname: 'image',
        encoding: '7bit',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const expectedResult = {
        path: '/uploads/test-image-1234567890.jpg',
      };

      mockUploadsService.getUploadedFilePath.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile);

      expect(result).toEqual(expectedResult);
      expect(uploadsService.getUploadedFilePath).toHaveBeenCalledWith(mockFile);
    });

    it('should handle file with backslashes in path', () => {
      const mockFile = {
        path: 'uploads\\test-image.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const expectedResult = {
        path: '/uploads/test-image.jpg',
      };

      mockUploadsService.getUploadedFilePath.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile);

      expect(result).toEqual(expectedResult);
    });
  });
});

