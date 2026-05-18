import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Controller('uploads')
export class UploadsController {
  private readonly uploadDir = './uploads';

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          cb(
            new BadRequestException(
              'Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Gambar yang akan diupload (jpg, jpeg, png, gif, webp)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload gambar baru' })
  @ApiResponse({
    status: 201,
    description: 'Gambar berhasil diupload',
    schema: {
      example: {
        success: true,
        message: 'Gambar berhasil diupload',
        filename: 'a1b2c3d4e5f6g7h8.jpg',
        url: 'http://localhost:3000/uploads/a1b2c3d4e5f6g7h8.jpg',
        size: 245678,
        mimetype: 'image/jpeg',
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    return {
      success: true,
      message: 'Gambar berhasil diupload',
      filename: file.filename,
      url: `http://localhost:3000/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'Dapatkan daftar semua gambar yang diupload' })
  @ApiResponse({
    status: 200,
    description: 'Daftar gambar',
    schema: {
      example: {
        success: true,
        count: 5,
        files: [
          {
            filename: 'a1b2c3d4e5f6g7h8.jpg',
            url: 'http://localhost:3000/uploads/a1b2c3d4e5f6g7h8.jpg',
            size: 245678,
            uploadedAt: '2024-01-27T18:54:00.000Z',
          },
        ],
      },
    },
  })
  async getUploadedFiles() {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
      );

      const fileDetails = imageFiles.map((file) => {
        const filePath = join(this.uploadDir, file);
        const stats = fs.statSync(filePath);

        return {
          filename: file,
          url: `http://localhost:3000/uploads/${file}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
        };
      });

      return {
        success: true,
        count: fileDetails.length,
        files: fileDetails,
      };
    } catch (error) {
      throw new BadRequestException('Gagal membaca folder uploads');
    }
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Download/preview gambar' })
  @ApiResponse({
    status: 200,
    description: 'Gambar ditemukan',
  })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = join(this.uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Gambar tidak ditemukan',
        });
      }

      res.sendFile(filePath, { root: '.' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil gambar',
      });
    }
  }

  @Post('delete/:filename')
  @ApiOperation({ summary: 'Hapus gambar yang sudah diupload' })
  @ApiResponse({
    status: 200,
    description: 'Gambar berhasil dihapus',
    schema: {
      example: {
        success: true,
        message: 'Gambar berhasil dihapus',
        filename: 'a1b2c3d4e5f6g7h8.jpg',
      },
    },
  })
  async deleteImage(@Param('filename') filename: string) {
    try {
      const filePath = join(this.uploadDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('Gambar tidak ditemukan');
      }

      fs.unlinkSync(filePath);

      return {
        success: true,
        message: 'Gambar berhasil dihapus',
        filename,
      };
    } catch (error) {
      throw new BadRequestException('Gagal menghapus gambar');
    }
  }
}   