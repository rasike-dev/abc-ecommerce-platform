import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly useBlobStorage: boolean;

  constructor(private readonly configService: ConfigService) {
    // Check if Vercel Blob is configured
    this.useBlobStorage = !!this.configService.get('BLOB_READ_WRITE_TOKEN');
  }

  async uploadFile(file: Express.Multer.File): Promise<{ path: string }> {
    let fileUrl: string;

    if (this.useBlobStorage) {
      // Upload to Vercel Blob - file is in memory as buffer
      if (!file.buffer) {
        throw new Error('File buffer is required for blob storage');
      }

      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      
      try {
        const blob = await put(uniqueFilename, file.buffer, {
          access: 'public',
          contentType: file.mimetype,
        });
        
        fileUrl = blob.url; // Full CDN URL
      } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        throw new Error('Failed to upload file to blob storage');
      }
    } else {
      // Local filesystem - file.path is already set by multer diskStorage
      if (!file.path) {
        throw new Error('File path is required for local storage');
      }
      fileUrl = `/${file.path.replace(/\\/g, '/')}`;
    }

    return { path: fileUrl };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Handle null, undefined, or empty strings
    if (!fileUrl || typeof fileUrl !== 'string') {
      return;
    }

    if (this.useBlobStorage && fileUrl.startsWith('http')) {
      // Delete from Vercel Blob
      try {
        await del(fileUrl);
      } catch (error) {
        console.error('Error deleting from Vercel Blob:', error);
        // Don't throw - file might already be deleted
      }
    } else if (!this.useBlobStorage && fileUrl.startsWith('/uploads/')) {
      // Delete from local filesystem
      try {
        const filePath = path.join(process.cwd(), fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting local file:', error);
        // Don't throw - file might already be deleted
      }
    }
  }
}
