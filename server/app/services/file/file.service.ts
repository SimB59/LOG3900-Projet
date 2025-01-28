/* eslint-disable @typescript-eslint/prefer-for-of */
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';
import { PNG } from 'pngjs';
import {
    CARDS_LOCATION,
    CONSTANTS_PATH,
    DIFFERENCES_LOCATION,
    FILTER_LOCATION,
    HEIGHT,
    IMG_LOCATION,
    PIXEL_LENGTH,
    TESTS_FOLDER_NAME,
    WIDTH,
} from './file.service.constants';

@Injectable()
export class FileService {
    async getCard(id: string): Promise<Card> {
        const cardPath = this.getCardPath(id);
        const buffer = await fsPromise.readFile(cardPath);
        const card = JSON.parse(buffer.toString()) as Card;
        return card;
    }

    async getCardDifferences(id: string): Promise<Coordinate[][]> {
        const differencesPath = this.getDifferencesLocation(id);
        const differences = (await fsPromise.readFile(differencesPath)).toString();
        return JSON.parse(differences);
    }

    async getConstants(): Promise<GameConstants> {
        const constants = (await fsPromise.readFile(CONSTANTS_PATH)).toString();
        return JSON.parse(constants) as GameConstants;
    }

    async fileExists(folderPath: string): Promise<boolean> {
        // Source : https://nodejs.org/api/fs.html#fspromisesaccesspath-mode
        try {
            await fsPromise.access(folderPath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    getCardPath(id: string): string {
        return process.cwd() + '/' + CARDS_LOCATION + id + '.json';
    }

    getFilterPathOriginal(id: string, index: number): string {
        return `${process.cwd()}/${FILTER_LOCATION}/${id}_${index}_original.png`;
    }

    getFilterPathModified(id: string, index: number): string {
        return `${process.cwd()}/${FILTER_LOCATION}/${id}_${index}_modified.png`;
    }

    getImageLocation(id: string, type: string): string {
        const folderPath = process.cwd() + '/' + IMG_LOCATION + id;
        return type === 'original' ? folderPath + '_original.bmp' : folderPath + '_modified.bmp';
    }

    buildImagePath(id: string): string {
        const folderPath = process.cwd() + '/' + IMG_LOCATION + id;
        return folderPath;
    }

    getDifferencesLocation(id: string): string {
        return process.cwd() + '/' + DIFFERENCES_LOCATION + id + '_differences.json';
    }

    async saveDifferences(id: string, differences: Coordinate[][]): Promise<void> {
        const differencesPath = this.getDifferencesLocation(id);
        await fsPromise.writeFile(differencesPath, JSON.stringify(differences));
    }

    write(folderPath: string, data: string | NodeJS.ArrayBufferView) {
        fs.writeFileSync(folderPath, data);
    }

    async remove(folderPath: string): Promise<void> {
        await fsPromise.rm(folderPath);
    }

    async emptyFolder(folderPath: string): Promise<void> {
        const folderContents = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const file of folderContents) {
            if (file.name.startsWith('.') || file.name === TESTS_FOLDER_NAME) {
                continue;
            }
            const filePath = folderPath + '/' + file.name;
            const fileStats = fs.statSync(filePath);
            if (fileStats.isDirectory()) {
                const subFolderContents = fs.readdirSync(filePath);
                if (subFolderContents.length !== 0) {
                    await this.emptyFolder(filePath);
                }
            } else {
                fs.unlinkSync(filePath);
            }
        }
    }

    async getAllCardsFilenames(): Promise<string[]> {
        const cardsPath = process.cwd() + '/' + CARDS_LOCATION;
        const files = await fsPromise.readdir(cardsPath);
        const filteredFiles = files.filter((file) => !file.toString().startsWith('.'));
        return filteredFiles;
    }

    async getAllActiveCardsFilenames(): Promise<string[]> {
        const filePath = process.cwd() + '/assets/activeCards.json';
        const buffer = await fsPromise.readFile(filePath);
        const jsonArray = JSON.parse(buffer.toString());
        const fileNameArray = jsonArray.map((item: { id: string }) => `${item.id}.json`);
        return fileNameArray;
    }

    async getActiveCardsAsString(): Promise<string> {
        const filePath = process.cwd() + '/assets/activeCards.json';
        const buffer = await fsPromise.readFile(filePath);
        return buffer.toString();
    }

    async addIdToActiveCards(idToAdd: string): Promise<void> {
        const filePath = process.cwd() + '/assets/activeCards.json';
        const buffer = await fsPromise.readFile(filePath);
        const jsonData = JSON.parse(buffer.toString());
        const idExists = jsonData.some((item: { id: string }) => item.id === idToAdd);
        if (!idExists) {
            jsonData.push({ id: idToAdd });
            const updatedJsonData = JSON.stringify(jsonData, null, 2);
            this.write(filePath, updatedJsonData);
        } else {
            throw new Error('Card id already exists');
        }
    }

    async createImageFilters(differences: Coordinate[][], cardId: string): Promise<void> {
        const placeHolderPath = `${process.cwd()}/assets/placeHolder.png`;
        const placeholderData = fs.readFileSync(placeHolderPath);
        const placeholderImage = PNG.sync.read(placeholderData);
        const placeholderPixels = placeholderImage.data;

        const originalImagePath = this.getImageLocation(cardId, 'original');
        const modifiedImagePath = this.getImageLocation(cardId, 'modified');

        const originalImageData = fs.readFileSync(originalImagePath);
        const originalImage = PNG.sync.read(originalImageData);
        const originalPixels = originalImage.data;

        const modifiedImageData = fs.readFileSync(modifiedImagePath);
        const modifiedImage = PNG.sync.read(modifiedImageData);
        const modifiedPixels = modifiedImage.data;

        for (let i = 0; i < differences.length; i++) {
            const tempPixels = Buffer.from(placeholderPixels);
            const tempOriginalPixels = Buffer.from(originalPixels);

            for (let j = 0; j < differences[i].length; j++) {
                const { x, y } = differences[i][j];
                const replacementIndex = (WIDTH * y + x) * PIXEL_LENGTH;
                const originalIndex = (originalImage.width * y + x) * PIXEL_LENGTH;

                tempPixels[replacementIndex] = tempOriginalPixels[originalIndex];
                tempPixels[replacementIndex + 1] = tempOriginalPixels[originalIndex + 1];
                tempPixels[replacementIndex + 2] = tempOriginalPixels[originalIndex + 2];
                tempPixels[replacementIndex + 3] = tempOriginalPixels[originalIndex + 3];
            }

            const newImage = new PNG({
                width: WIDTH,
                height: HEIGHT,
                inputHasAlpha: true,
            });
            newImage.data = tempPixels;

            // Mettre filtre contenant pixels de l'image originale sur l'image modifiee
            const fileStream = fs.createWriteStream(`${process.cwd()}/${FILTER_LOCATION}/${cardId}_${i}_modified.png`);
            newImage.pack().pipe(fileStream);
        }

        for (let i = 0; i < differences.length; i++) {
            const tempPixels = Buffer.from(placeholderPixels);
            const tempOriginalPixels = Buffer.from(modifiedPixels);

            for (let j = 0; j < differences[i].length; j++) {
                const { x, y } = differences[i][j];
                const replacementIndex = (WIDTH * y + x) * PIXEL_LENGTH;
                const modifiedIndex = (modifiedImage.width * y + x) * PIXEL_LENGTH;

                tempPixels[replacementIndex] = tempOriginalPixels[modifiedIndex];
                tempPixels[replacementIndex + 1] = tempOriginalPixels[modifiedIndex + 1];
                tempPixels[replacementIndex + 2] = tempOriginalPixels[modifiedIndex + 2];
                tempPixels[replacementIndex + 3] = tempOriginalPixels[modifiedIndex + 3];
            }

            const newImage = new PNG({
                width: WIDTH,
                height: HEIGHT,
                inputHasAlpha: true,
            });
            newImage.data = tempPixels;

            // Mettre filtre contenant pixels de l'image modifiee sur l'image originale
            const fileStream = fs.createWriteStream(`${process.cwd()}/${FILTER_LOCATION}/${cardId}_${i}_original.png`);
            newImage.pack().pipe(fileStream);
        }
    }

    getOffsetIndex(coord: Coordinate): number {
        return PIXEL_LENGTH * (coord.y * WIDTH + coord.x) /* + 54*/;
    }

    async removeImageFilters(id: string, numberOfDifferences: number): Promise<void> {
        for (let i = 0; i < numberOfDifferences; i++) {
            await this.remove(this.getFilterPathOriginal(id, i));
            await this.remove(this.getFilterPathModified(id, i));
        }
    }
}
