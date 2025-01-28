/* eslint-disable */
import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    protected resetTokens = new Map();
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    
    async sendPasswordResetEmail(to: string, generatedCode: string): Promise<void> {
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.EMAIL_FROM_ADDRESS,
            to,
            subject: 'Password Reset Request',
            text: `You have requested the reset of the password for your TTD account, your code is: ${generatedCode}`,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
