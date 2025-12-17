import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let uploadsService: UploadsService;
  let configService: ConfigService;

  const mockUploadsService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    uploadsService = module.get<UploadsService>(UploadsService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /upload', () => {
    it('should return uploaded file path for local storage', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        path: 'uploads/image-1234567890.jpg',
        buffer: undefined,
      } as Express.Multer.File;

      const expectedResult = {
        path: '/uploads/image-1234567890.jpg',
      };

      mockUploadsService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile);

      expect(result).toEqual(expectedResult);
      expect(uploadsService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(uploadsService.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('should return uploaded file URL for blob storage', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test image data'),
        path: undefined,
      } as Express.Multer.File;

      const expectedResult = {
        path: 'https://blob.vercel-storage.com/test-image-1234567890.jpg',
      };

      mockUploadsService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile);

      expect(result).toEqual(expectedResult);
      expect(uploadsService.uploadFile).toHaveBeenCalledWith(mockFile);
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const mockFile = undefined;

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        'No file uploaded',
      );
      expect(uploadsService.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is null', async () => {
      const mockFile = null as any;

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(uploadsService.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const error = new Error('Upload failed');
      mockUploadsService.uploadFile.mockRejectedValue(error);

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(error);
      expect(uploadsService.uploadFile).toHaveBeenCalledWith(mockFile);
    });

    it('should handle different file types', async () => {
      const jpegFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        path: 'uploads/test.jpg',
      } as Express.Multer.File;

      const pngFile = {
        fieldname: 'image',
        originalname: 'test.png',
        mimetype: 'image/png',
        path: 'uploads/test.png',
      } as Express.Multer.File;

      mockUploadsService.uploadFile.mockResolvedValue({ path: '/uploads/test.jpg' });
      await controller.uploadFile(jpegFile);

      mockUploadsService.uploadFile.mockResolvedValue({ path: '/uploads/test.png' });
      await controller.uploadFile(pngFile);

      expect(uploadsService.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should handle files with different sizes', async () => {
      const smallFile = {
        fieldname: 'image',
        originalname: 'small.jpg',
        mimetype: 'image/jpeg',
        size: 100,
        path: 'uploads/small.jpg',
      } as Express.Multer.File;

      const largeFile = {
        fieldname: 'image',
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
        path: 'uploads/large.jpg',
      } as Express.Multer.File;

      mockUploadsService.uploadFile.mockResolvedValue({ path: '/uploads/small.jpg' });
      await controller.uploadFile(smallFile);

      mockUploadsService.uploadFile.mockResolvedValue({ path: '/uploads/large.jpg' });
      await controller.uploadFile(largeFile);

      expect(uploadsService.uploadFile).toHaveBeenCalledTimes(2);
    });
  });
});
