import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.use(json({ limit: '5MB' }));
    app.use(urlencoded({ extended: true, limit: '5MB' }));
    app.use(cookieParser());

    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du jeu des différences pour le cours de LOG3900')
        .setVersion('1.0.1')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);
    await app.listen(process.env.PORT);
};

bootstrap();
