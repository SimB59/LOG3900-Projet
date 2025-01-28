/* eslint-disable */
import { ConnectionType } from '@app/model/database/player-connection';
import { Language } from '@app/model/interfaces/language';
import { Theme } from '@app/model/interfaces/theme';
import { AccountService } from '@app/services/account/account.service';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Message } from '@common/message';
import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import path = require("path")
import fs = require("fs")

@ApiTags('Account')
@Controller('account')
export class AccountController {
    constructor(private accountService: AccountService, private authenticationService: AuthenticationService) {}

    @ApiOkResponse({
        description: 'Create account',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when request is badly formulated',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when the given email address is not valid',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when the given pseudo is not valid',
    })
    @Post()
    @UseInterceptors(FileInterceptor('avatarPicture', {
        storage: diskStorage({
            destination: './assets/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => (Math.round(Math.random() * 16)).toString(16))
                    .join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }
        })
    }))
    async createAccount(@Body() body: any, @UploadedFile() file: Express.Multer.File, @Res() response: Response) {
        try {
            if (await this.accountService.isEmailValid(body.email)) {
                if (await this.accountService.isPseudoAvailable(body.pseudo)) {
                    const ids = this.accountService.generateAccountId();
                    if (file) {
                        // Renaming the avatarPicture filename to the generated accountId
                        const originalTempPath = path.join('./assets/avatars', file.filename);
                        const newFilename = `${ids}${path.extname(file.originalname)}`;
                        const newFilePath = path.join('./assets/avatars', newFilename);
                        fs.rename(originalTempPath, newFilePath, err => {
                            if (err) {
                                return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err.message);
                            }
                        });
                    }
                    await this.accountService.createAccount(body, ids);
                    await this.authenticationService.loginUser(body.email, body.password, body.socketId);
                    await this.authenticationService.registerUserToken(body);
                    response.status(HttpStatus.OK).send(this.toMessage('OK', ids));
                } else {
                    response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Invalid pseudo'));
                }
            } else {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Invalid email'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Update avatar image',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when request is badly formulated',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when the given email address is not valid',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when the given pseudo is not valid',
    })
    @Post('update-avatar')
    @UseInterceptors(FileInterceptor('avatarPicture', {
        storage: diskStorage({
            destination: './assets/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => (Math.round(Math.random() * 16)).toString(16))
                    .join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }
        })
    }))
    async updateAvatarImage(@Body() body: any, @UploadedFile() file: Express.Multer.File, @Res() response: Response) {
        try {
            if (file) {
                const extension = path.extname(file.filename);
                if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
                    const accountId: string = body.userId;
                    const avatarFiles = fs.readdirSync('./assets/avatars');
                    const accountIdAvatar = avatarFiles.find(file => file.startsWith(accountId));
                    if (accountIdAvatar) {
                        const fileToDeletePath = path.join('./assets/avatars', accountIdAvatar);
                        // delete the previous avatar image to prevent having two images with the same accountId but different extensions
                        fs.unlinkSync(fileToDeletePath);
                    }
                    const originalTempPath = path.join('./assets/avatars', file.filename);
                    const newFilename = `${accountId}${path.extname(file.originalname)}`;
                    const newFilePath = path.join('./assets/avatars', newFilename);
                    fs.rename(originalTempPath, newFilePath, err => {
                        if (err) {
                            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', err.message));
                        }
                    });
                    response.status(HttpStatus.OK).send(this.toMessage('OK', accountId));
                } else {
                    response.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).send(this.toMessage('UNSUPPORTED MEDIA TYPE', 'File extension not supported'));
                }
            } else {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'File not provided'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Get account data',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/:pseudo')
    async getAccount(@Param('pseudo') pseudoName: string, @Res() response: Response) {
        try {
            //TODO: adapt so that it returns the imageData by locating the image in the file system
            const accountData = await this.accountService.getAccountData(pseudoName);
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(accountData)));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Get account data',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/accountid/:pseudo')
    async getAccountId(@Param('pseudo') pseudoName: string, @Res() response: Response) {
        try {
            const accountId = await this.accountService.getAccountId(pseudoName);
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(accountId)));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Get('/avatar/:accountId')
    async getAvatarUint8List(@Param('accountId') accountId: string, @Res() response: Response) {
        try {
            const avatarFiles = fs.readdirSync('./assets/avatars');
            const accountIdAvatar = avatarFiles.find(file => file.startsWith(accountId));
            const filePath = path.join(process.cwd(), './assets/avatars', accountIdAvatar);
            if(fs.existsSync(filePath)) {
                response.status(200).sendFile(filePath);
            } else {
                response.status(404).send('Image not found');
            }
        } catch (error) {
            // Handle any errors
            console.error('Error retrieving image:', error);
            response.status(500).send('Internal Server Error');
        }
    }

    @ApiOkResponse({
        description: 'Update PseudoName',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Post('/pseudo')
    async savePseudo(@Body() body: any, @Res() response: Response) {
        // body is a JSON object with the following fields: oldPseudo, newPseudo
        try {
            const isPseudoAvailable = await this.accountService.savePseudo(body.oldPseudo, body.newPseudo);
            if (!isPseudoAvailable) {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Pseudo is not unique'));
            } else {
                response.status(HttpStatus.OK).send(this.toMessage('OK', 'Pseudo saved correctly'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Update preferences',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Post('/preferences')
    async savePreferences(@Body() body: Message, @Res() response: Response) {
        try {
            const information = JSON.parse(body.body);
            const userId: string = information.userId;
            const language: Language = information.language;
            const theme: Theme = information.theme;
            if (userId) {
                if (language) {
                    await this.accountService.saveLanguage(userId, language);
                }
                if (theme) {
                    await this.accountService.saveTheme(userId, theme);
                }
                response.status(HttpStatus.OK).send(this.toMessage('OK', 'Preferences saved correctly'));
            } else {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'No user to link preferences'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Verify authentication',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when the given email/password combo is not valid',
    })
    @Post('/auth')
    async validateLogin(@Body() body: Message, @Res() response: Response) {
        try {
            const credentials = JSON.parse(body.body);
            const userId = await this.accountService.getAccountIdByPseudo(credentials.pseudo);
            const isAlreadyConnected = this.authenticationService.isAlreadyConnected(userId);
            const email = await this.accountService.getAccountEmailByPseudo(credentials.pseudo);
            const isValidLogin = await this.authenticationService.loginUser(email, credentials.password, credentials.socketId);
            if (isAlreadyConnected) {
                response.status(HttpStatus.UNAUTHORIZED).send(this.toMessage('UNAUTHORIZED', 'User already connected'));
            } else if (!isValidLogin) {
                response.status(HttpStatus.NOT_FOUND).send(this.toMessage('NOT FOUND', 'User not found'));
            } else {
                const token = this.authenticationService.sessionsStore[userId];
                response.cookie('token', token, { httpOnly: true, secure: false });
                response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify({userId, pseudo:credentials.pseudo, email})));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Post('/auth/logout')
    async logout(@Req() request: Request, @Body() body: Message, @Res() response: Response) {
        try {
            const information = JSON.parse(body.body);
            const userId: string = information.userId;
            if (userId) {
                await this.authenticationService.logoutUser(userId);
                response.status(HttpStatus.OK).send(this.toMessage('OK', 'Logged out'));
            } else {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'No user logged in'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Post('/auth/debug/logoutall')
    async logoutAll(@Res() response: Response) {
        try {
            this.authenticationService.logoutAll();
            response.status(HttpStatus.OK).send(this.toMessage('OK', 'Logged out all'));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Post('/send-password-email')
    async sendPasswordEmail(@Body() body: any, @Res() response: Response) {
        try {
            const emailExistsInDB: boolean = await this.accountService.getAccountIdByEmail(body.email) !== '';
            if (emailExistsInDB) {
                await this.accountService.sendResetPasswordEmail(body.email, body.generatedCode);
                response.status(HttpStatus.OK).send(this.toMessage('OK', 'Forgot password email sent'));
            } else {
                response.status(HttpStatus.NOT_FOUND).send(this.toMessage('NOT FOUND', 'No user found with this email'));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Post('/reset-password')
    async forgotPassword(@Body() body: any, @Res() response: Response) {
        try {;
            await this.authenticationService.resetPassword(body.email, body.newPassword);
            response.status(HttpStatus.OK).send(this.toMessage('OK', 'Password reset successfully'));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @Post('/connection')
    async createConnectionLogin(@Body() body: any, @Res() response: Response) {
        //body contains a field accountId and a field connection type either 'login' or 'logout' 
        try {
            if (body.connectionType === 'login') {
                await this.accountService.createAccountConnection(body.accountId, ConnectionType.LOGIN);
            } else if (body.connectionType === 'logout') {
                await this.accountService.createAccountConnection(body.accountId, ConnectionType.LOGOUT);
            } else {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD_REQUEST', 'Invalid connection type'));
            }  
        }
        catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    private toMessage(title: string, data: string): Message {
        return {
            title,
            body: data,
        };
    }
}
