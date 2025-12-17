import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';
import { ConfigService } from '@nestjs/config';

// Check if Vercel Blob is configured (at module load time)
const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;

// Multer configuration based on environment
const multerConfig = {
  storage: useBlobStorage
    ? memoryStorage() // File stays in RAM as buffer for Vercel Blob
    : diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    const allowedExtensions = /jpg|jpeg|png/;
    const extMatch = allowedExtensions.test(
      extname(file.originalname).toLowerCase(),
    );
    const mimeMatch = allowedExtensions.test(file.mimetype);

    if (extMatch && mimeMatch) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Images only!'), false);
    }
  },
};

@ApiTags('Uploads')
@Controller('upload') // Changed to 'upload' to match frontend API call
@UseGuards(JwtAuthGuard, RolesGuard)
@Admin()
@ApiBearerAuth('JWT-auth')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadsService.uploadFile(file);
  }
}
