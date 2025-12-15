import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  getUploadedFilePath(file: Express.Multer.File): { path: string } {
    return {
      path: `/${file.path.replace(/\\/g, '/')}`,
    };
  }
}

