import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';

const uploadPath = join(process.cwd(), 'uploads', 'modelos');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

export const multerImagenOptions = {
  storage: diskStorage({
    destination: uploadPath,
    filename: (req: any, file: any, cb: any) => {
      const ext = extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          'Formato no soportado. Usa JPG, PNG o WEBP.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
};