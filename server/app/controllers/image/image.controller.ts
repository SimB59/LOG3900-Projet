/* eslint-disable */
import { AVATAR_LOCATION, FILTER_LOCATION, IMG_LOCATION } from '@app/services/differences-detection/differences-detection.service.constants';
import { Controller, Get, HttpStatus, Param, Post, Res, StreamableFile, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import fs = require('fs');

@Controller('image')
export class ImageController {
    @Get('/:id')
    getImage(@Param('id') imgId: string, @Res({ passthrough: true }) res: Response): StreamableFile {
        try {
            const file = createReadStream(join(join(process.cwd(), IMG_LOCATION), imgId + '.bmp'));
            res.set({
                // Disable lint because we need to set header to make reponse work
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'image/bmp',
                // Disable lint because we need to set header to make reponse work
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Disposition': 'attachment; filename="' + imgId + '.bmp"',
            });
            return new StreamableFile(file);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }

    // Cette fonction fait la meme chose que '/:id', mais optimise pour client leger
    @Get('/light/:id')
    getImageLight(@Param('id') imgId: string, @Res() res: Response) : void {
        try {
            const imagePath = join(process.cwd(), IMG_LOCATION, imgId + '.bmp');
            const imageStream = createReadStream(imagePath);

            res.writeHead(HttpStatus.OK, {
                'Content-Type': 'image/bmp', // Change Content-Type to image/bmp
                'Content-Disposition': `attachment; filename="${imgId}.bmp"`,
            });

            imageStream.pipe(res);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }

    @Get('/filter/:id')
    getFilterImage(@Param('id') imgId: string, @Res() res: Response): void {
        try {
            const imagePath = join(process.cwd(), FILTER_LOCATION, imgId + '.png');
            const imageStream = createReadStream(imagePath);

            res.writeHead(HttpStatus.OK, {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${imgId}.png"`,
            });

            imageStream.pipe(res);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }

    @Get('/avatar/profile/:id')
    getAvatarProfileImage(@Param('id') imgId: string, @Res() res: Response): void {
        try {
            const imagePath = join(process.cwd(), AVATAR_LOCATION, imgId + '.png');
            const imageStream = createReadStream(imagePath);

            res.writeHead(HttpStatus.OK, {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${imgId}.png"`,
            });

            imageStream.pipe(res);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }

    @Get('/avatar/:id')
    async getAvatarImage(@Param('id') imgId: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
        try {
            const fileNameWithoutExtension = imgId;
            const directoryPath = join(process.cwd(), AVATAR_LOCATION);
            // Create a Promise to handle the asynchronous file reading operation
            const filePromise = new Promise<StreamableFile>((resolve, reject) => {
                // Read the contents of the directory
                fs.readdir(directoryPath, (err, files) => {
                    if (err) {
                        reject('INTERNAL SERVER ERROR. Error reading directory: ' + err);
                        return;
                    }

                    // Filter files based on the filename (ignoring extension)
                    const matchingFiles = files.filter((file) => file.startsWith(fileNameWithoutExtension));

                    if (matchingFiles.length === 0) {
                        reject('Image not found with id ' + fileNameWithoutExtension);
                        return;
                    }

                    // For simplicity, let's assume we only take the first matching file
                    const actualFileName = matchingFiles[0];
                    const actualFileExtension = extname(actualFileName);
                    const actualFile = createReadStream(join(directoryPath, actualFileName));
                    const contentType = actualFileExtension === '.png' ? 'image/png' : 'image/jpg';
                    res.set({
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Content-Type': contentType,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Content-Disposition': `attachment; filename="${imgId}${actualFileExtension}"`,
                    });

                    // Resolve the Promise with the StreamableFile
                    resolve(new StreamableFile(actualFile));
                });
            });
            return filePromise;
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error ' + error);
        }
    }

    @Post('/avatar/:id')
    saveAvatarImage(@Param('id') imgId: string, @UploadedFile() file: Express.Multer.File, res: Response): void {
        try {
            //eslint-disable-next-line
            // console.log(imgId);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }
}
