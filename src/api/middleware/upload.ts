import { Response, Request, RequestHandler, NextFunction } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import * as multer from 'multer';
import { extname, resolve } from 'path';
import { sync } from 'mkdirp';
import imageSize from 'image-size';
import { fromFile } from 'file-type';
import isVideo from 'is-video';
import isImage from 'is-image';
import Ffmpeg from 'ffmpeg';
import { File } from '../../types/file';
import config from '../../config/config';

@injectable()
export class UploadMiddleware extends BaseMiddleware {
  async handler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.file) {
        const { filename, size, path } = req.file;

        const { ext, mime } = await fromFile(path);

        let type: File['type'];

        let thumbnail = filename;

        if (isVideo(path)) {
          type = 'video';

          const file_name = filename.substring(0, filename.indexOf('.'));

          const video = await new Ffmpeg(path);

          await video.fnExtractFrameToJPG(resolve(config.FILE_PATH), {
            number: 1,
            file_name,
          });

          thumbnail = `${file_name}_1.jpg`;
        } else if (isImage(path)) type = 'image';
        else throw new Error('File type is not supported');

        const { height, width, orientation } = imageSize(`${resolve(config.FILE_PATH)}/${thumbnail}`);

        const file: File = {
          ext,
          mime,
          type,
          thumbnail: thumbnail,
          filename,
          size,
          dimensions: { height, width, orientation: orientation || 1 },
        };

        req.body.file = file;
      } else if (req.files) {
        const files: File[] = [];
        for (const f of req.files as Express.Multer.File[]) {
          const { filename, size, path } = f;

          const { ext, mime } = await fromFile(path);

          let type: File['type'];

          let thumbnail = filename;

          if (isVideo(path)) {
            type = 'video';

            const file_name = filename.substring(0, filename.indexOf('.'));

            const video = await new Ffmpeg(path);

            await video.fnExtractFrameToJPG(resolve(config.FILE_PATH), {
              number: 1,
              file_name,
            });

            thumbnail = `${file_name}_1.jpg`;
          } else if (isImage(path)) type = 'image';
          else throw new Error('File type is not supported');

          const { height, width, orientation } = imageSize(`${resolve(config.FILE_PATH)}/${thumbnail}`);

          const file: File = {
            ext,
            mime,
            type,
            thumbnail: thumbnail,
            filename,
            size,
            dimensions: { height, width, orientation: orientation || 1 },
          };

          files.push(file);
        }

        req.body.files = files;
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

export function upload(options: { filePath: string; fileName?: string; count?: number }): RequestHandler {
  const { filePath, fileName, count } = options;
  const uploader = multer.default({
    dest: filePath,
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        sync(filePath);
        callback(null, filePath);
      },
      filename: (req, file, callback) => {
        callback(null, Date.now() + extname(file.originalname));
      },
    }),
  });

  if (count) return uploader.array(fileName, count);

  return uploader.single(fileName || 'file');
}
