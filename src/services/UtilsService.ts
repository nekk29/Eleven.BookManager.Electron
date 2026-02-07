import { dialog, BrowserWindow, WebContents } from 'electron';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';
import EmailDto from '../models/dto/EmailDto';
import SmtpSettings from '../models/settings/SmtpSettings';

export default class UtilsService {
    static async openFolderDialog(webContents: WebContents): Promise<string | null> {
        const window = BrowserWindow.fromWebContents(webContents);
        if (!window) return null;

        const result = await dialog.showOpenDialog(window, {
            properties: ['openDirectory']
        });

        if (result.canceled) {
            return null;
        } else {
            return result.filePaths[0];
        }
    }

    static validateEmail(email: string) {
        const emailParser = z.email();
        const parsed = emailParser.safeParse(email);
        return parsed.success;
    }

    static async validateSmtpSettings(smtpSettings: SmtpSettings): Promise<string[]> {
        const errors: string[] = [];
        const validSmtpPorts = [587, 465, 25, 2525, 25025];

        const serverValid = smtpSettings.server != null && smtpSettings.server != undefined && smtpSettings.server != '';
        if (!serverValid) errors.push('Invalid value for Smtp Server');

        const portValid = validSmtpPorts.includes(smtpSettings.port);
        if (!portValid) errors.push(`Invalid value for Smtp Port. Valid port values are: ${validSmtpPorts.join(', ')}`);

        const fromValid = this.validateEmail(smtpSettings.from);
        if (!fromValid) errors.push('Invalid format for From Email');

        const emailValid = this.validateEmail(smtpSettings.email);
        if (!emailValid) errors.push('Invalid format for Smtp Email');

        const passwordValid = smtpSettings.password != null && smtpSettings.password != undefined && smtpSettings.password != '';
        if (!passwordValid) errors.push('Invalid value for Smtp Password');

        if (errors.length > 0) return errors;

        const config = {
            host: smtpSettings.server,
            port: smtpSettings.port,
            // true for 465, false for other ports
            secure: smtpSettings.port == 465,
            auth: {
                user: smtpSettings.email,
                pass: smtpSettings.password
            }
        }

        const transporter = nodemailer.createTransport(config);

        try {
            await transporter.verify();
        } catch (error) {
            errors.push(`SMTP validation failed: ${error}`);
            console.error(error);
        }

        return errors;
    }

    static async sendEmail(emailDto: EmailDto, smtpSettings: SmtpSettings): Promise<string[]> {
        const errors: string[] = [];

        const config = {
            host: smtpSettings.server,
            port: smtpSettings.port,
            // true for 465, false for other ports
            secure: smtpSettings.port == 465,
            auth: {
                user: smtpSettings.email,
                pass: smtpSettings.password
            }
        }

        const transporter = nodemailer.createTransport(config);

        try {
            await transporter.sendMail({
                from: {
                    name: emailDto.displayName ?? emailDto.from,
                    address: emailDto.from
                },
                to: emailDto.to,
                cc: emailDto.cc ?? [],
                subject: emailDto.subject,
                text: emailDto.body,
                attachments: emailDto.attachments ?? []
            });
        } catch (error) {
            errors.push(`SMTP mailing failed: ${error}`);
            console.error(error);
        }

        return errors;
    }
}
