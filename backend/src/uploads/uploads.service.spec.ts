import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';
import { put, del } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';

// Mock @vercel/blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
}));

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

describe('UploadsService', () => {
  let service: UploadsService;
  let configService: ConfigService;
  let mockPut: jest.MockedFunction<typeof put>;
  let mockDel: jest.MockedFunction<typeof del>;

  const mockFileWithBuffer: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test image data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockFileWithPath: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: undefined,
    destination: './uploads',
    filename: 'image-1234567890.jpg',
    path: 'uploads/image-1234567890.jpg',
    stream: null as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPut = put as jest.MockedFunction<typeof put>;
    mockDel = del as jest.MockedFunction<typeof del>;
  });

  describe('with Blob Storage (BLOB_READ_WRITE_TOKEN set)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'BLOB_READ_WRITE_TOKEN') {
                  return 'test-blob-token';
                }
                return undefined;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<UploadsService>(UploadsService);
      configService = module.get<ConfigService>(ConfigService);
    });

    describe('uploadFile', () => {
      it('should upload file to Vercel Blob Storage', async () => {
        const mockBlobUrl = 'https://blob.vercel-storage.com/test-image-1234567890.jpg';
        mockPut.mockResolvedValue({
          url: mockBlobUrl,
          pathname: 'test-image-1234567890.jpg',
          size: 1024,
          uploadedAt: new Date(),
        } as any);

        const result = await service.uploadFile(mockFileWithBuffer);

        expect(result).toEqual({ path: mockBlobUrl });
        expect(mockPut).toHaveBeenCalledWith(
          expect.stringMatching(/^\d+-[a-z0-9]+-test-image\.jpg$/),
          mockFileWithBuffer.buffer,
          {
            access: 'public',
            contentType: 'image/jpeg',
          },
        );
      });

      it('should throw error if file buffer is missing', async () => {
        const fileWithoutBuffer = {
          ...mockFileWithBuffer,
          buffer: undefined,
        } as Express.Multer.File;

        await expect(service.uploadFile(fileWithoutBuffer)).rejects.toThrow(
          'File buffer is required for blob storage',
        );
        expect(mockPut).not.toHaveBeenCalled();
      });

      it('should handle blob upload errors', async () => {
        const error = new Error('Blob upload failed');
        mockPut.mockRejectedValue(error);

        await expect(service.uploadFile(mockFileWithBuffer)).rejects.toThrow(
          'Failed to upload file to blob storage',
        );
        expect(mockPut).toHaveBeenCalled();
      });

      it('should generate unique filename', async () => {
        const mockBlobUrl = 'https://blob.vercel-storage.com/test.jpg';
        mockPut.mockResolvedValue({
          url: mockBlobUrl,
          pathname: 'test.jpg',
          size: 1024,
          uploadedAt: new Date(),
        } as any);

        await service.uploadFile(mockFileWithBuffer);

        const callArgs = mockPut.mock.calls[0];
        const filename = callArgs[0] as string;
        
        expect(filename).toMatch(/^\d+-[a-z0-9]+-test-image\.jpg$/);
        expect(filename).toContain('test-image.jpg');
      });
    });

    describe('deleteFile', () => {
      it('should delete file from Vercel Blob Storage', async () => {
        const blobUrl = 'https://blob.vercel-storage.com/test-image.jpg';
        mockDel.mockResolvedValue(undefined);

        await service.deleteFile(blobUrl);

        expect(mockDel).toHaveBeenCalledWith(blobUrl);
        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
      });

      it('should not throw error if blob deletion fails', async () => {
        const blobUrl = 'https://blob.vercel-storage.com/test-image.jpg';
        const error = new Error('File not found');
        mockDel.mockRejectedValue(error);

        // Should not throw
        await expect(service.deleteFile(blobUrl)).resolves.not.toThrow();
        expect(mockDel).toHaveBeenCalledWith(blobUrl);
      });

      it('should not delete if URL does not start with http', async () => {
        const localPath = '/uploads/test-image.jpg';

        await service.deleteFile(localPath);

        expect(mockDel).not.toHaveBeenCalled();
        expect(fs.existsSync).not.toHaveBeenCalled();
      });
    });
  });

  describe('with Local Filesystem (BLOB_READ_WRITE_TOKEN not set)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'BLOB_READ_WRITE_TOKEN') {
                  return undefined;
                }
                return undefined;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<UploadsService>(UploadsService);
      configService = module.get<ConfigService>(ConfigService);
    });

    describe('uploadFile', () => {
      it('should return local file path', async () => {
        const result = await service.uploadFile(mockFileWithPath);

        expect(result).toEqual({
          path: '/uploads/image-1234567890.jpg',
        });
        expect(mockPut).not.toHaveBeenCalled();
      });

      it('should normalize path separators', async () => {
        const fileWithBackslashes = {
          ...mockFileWithPath,
          path: 'uploads\\test\\image.jpg',
        };

        const result = await service.uploadFile(fileWithBackslashes);

        expect(result.path).toBe('/uploads/test/image.jpg');
        expect(result.path).not.toContain('\\');
      });

      it('should throw error if file path is missing', async () => {
        const fileWithoutPath = {
          ...mockFileWithPath,
          path: undefined,
        } as any;

        await expect(service.uploadFile(fileWithoutPath)).rejects.toThrow(
          'File path is required for local storage',
        );
      });
    });

    describe('deleteFile', () => {
      it('should delete file from local filesystem', async () => {
        const localPath = '/uploads/test-image.jpg';
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

        await service.deleteFile(localPath);

        expect(path.join).toHaveBeenCalledWith(process.cwd(), localPath);
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.unlinkSync).toHaveBeenCalled();
        expect(mockDel).not.toHaveBeenCalled();
      });

      it('should not delete if file does not exist', async () => {
        const localPath = '/uploads/test-image.jpg';
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        await service.deleteFile(localPath);

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
      });

      it('should not throw error if file deletion fails', async () => {
        const localPath = '/uploads/test-image.jpg';
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.unlinkSync as jest.Mock).mockImplementation(() => {
          throw new Error('Permission denied');
        });

        // Should not throw
        await expect(service.deleteFile(localPath)).resolves.not.toThrow();
        expect(fs.unlinkSync).toHaveBeenCalled();
      });

      it('should not delete if URL does not start with /uploads/', async () => {
        const otherPath = '/other/test-image.jpg';

        await service.deleteFile(otherPath);

        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
      });

      it('should not delete blob URLs when using local storage', async () => {
        const blobUrl = 'https://blob.vercel-storage.com/test-image.jpg';

        await service.deleteFile(blobUrl);

        expect(mockDel).not.toHaveBeenCalled();
        expect(fs.existsSync).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'BLOB_READ_WRITE_TOKEN') {
                  return undefined;
                }
                return undefined;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<UploadsService>(UploadsService);
    });

    it('should handle empty file path gracefully', async () => {
      const emptyPath = '';

      await expect(service.deleteFile(emptyPath)).resolves.not.toThrow();
      expect(mockDel).not.toHaveBeenCalled();
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it('should handle null file path gracefully', async () => {
      const nullPath = null as any;

      await expect(service.deleteFile(nullPath)).resolves.not.toThrow();
    });
  });
});
