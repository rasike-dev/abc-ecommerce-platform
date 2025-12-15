import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadedFilePath', () => {
    it('should return file path with forward slashes', () => {
      const mockFile = {
        path: 'uploads\\test-image-1234567890.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = service.getUploadedFilePath(mockFile);

      expect(result).toEqual({
        path: '/uploads/test-image-1234567890.jpg',
      });
    });

    it('should handle paths with forward slashes', () => {
      const mockFile = {
        path: 'uploads/test-image-1234567890.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = service.getUploadedFilePath(mockFile);

      expect(result).toEqual({
        path: '/uploads/test-image-1234567890.jpg',
      });
    });

    it('should handle nested paths', () => {
      const mockFile = {
        path: 'uploads\\images\\products\\test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = service.getUploadedFilePath(mockFile);

      expect(result).toEqual({
        path: '/uploads/images/products/test.jpg',
      });
    });

    it('should handle paths starting with slash', () => {
      const mockFile = {
        path: '\\uploads\\test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = service.getUploadedFilePath(mockFile);

      expect(result.path).toContain('/uploads/');
    });
  });
});

