import { app } from 'electron';
import ElectronStore from "electron-store";
import Store, { Schema } from 'electron-store';
import UtilsService from "./UtilsService";
import AppSettings from "../models/settings/AppSettings";
import ResponseDto from "../models/dto/base/ResponseBaseDto";
import LibrarySettings from "../models/settings/LibrarySettings";
import CalibreSettings from "../models/settings/CalibreSettings";
import AmazonSettings from "../models/settings/AmazonSettings";
import SmtpSettings from "../models/settings/SmtpSettings";

export default class SettingsService {
    static createStore() {
        const storeInit = new Store();
        if (storeInit.has('librarySettings')) return;

        const schema: Schema<AppSettings> = {
            librarySettings: {
                type: 'object',
                properties: {
                    workingDirectory: { type: 'string', default: '', },
                },
                default: {
                    workingDirectory: '',
                },
                required: [
                    'workingDirectory'
                ],
            },
            calibreSettings: {
                type: 'object',
                properties: {
                    libraryDirectory: { type: 'string', default: '', },
                },
                default: {
                    libraryDirectory: '',
                },
                required: [
                    'libraryDirectory'
                ],
            },
            amazonSettings: {
                type: 'object',
                properties: {
                    accountEmail: { type: 'string', default: '', },
                },
                default: {
                    accountEmail: '',
                },
                required: [
                    'accountEmail'
                ],
            },
            smtpSettings: {
                type: 'object',
                properties: {
                    server: { type: 'string', default: 'smtp.gmail.com', },
                    port: { type: 'number', default: 587, },
                    from: { type: 'string', default: '', },
                    fromDisplayName: { type: 'string', default: '', },
                    email: { type: 'string', default: '', },
                    password: { type: 'string', default: '', },
                },
                default: {
                    server: 'smtp.gmail.com',
                    port: 587,
                    from: '',
                    fromDisplayName: '',
                    email: '',
                    password: '',
                },
                required: [
                    'server',
                    'port',
                    'from',
                    'email',
                    'password'
                ],
            }
        };

        new Store({ schema });
    }

    static setLibrarySettings(librarySettings: LibrarySettings) {
        if (!librarySettings) return;
        this.getStore().set('librarySettings', librarySettings);
    }

    static getLibrarySettings(): LibrarySettings {
        let librarySettings = this.getStore().get('librarySettings') as LibrarySettings;
        if (librarySettings) return librarySettings;

        librarySettings = { workingDirectory: app.getPath('userData') };
        this.setLibrarySettings(librarySettings);

        return librarySettings;
    }

    static setCalibreSettings(calibreSettings: CalibreSettings) {
        if (!calibreSettings) return;
        this.getStore().set('calibreSettings', calibreSettings);
    }

    static getCalibreSettings(): CalibreSettings {
        let calibreSettings = this.getStore().get('calibreSettings') as CalibreSettings;
        if (calibreSettings) return calibreSettings;

        calibreSettings = { libraryDirectory: app.getPath('userData') };
        this.setCalibreSettings(calibreSettings);

        return calibreSettings;
    }

    static setAmazonSettings(amazonSettings: AmazonSettings) {
        if (!amazonSettings) return;
        this.getStore().set('amazonSettings', amazonSettings);
    }

    static getAmazonSettings(): AmazonSettings {
        let amazonSettings = this.getStore().get('amazonSettings') as AmazonSettings;
        if (amazonSettings) return amazonSettings;

        amazonSettings = { accountEmail: '' };
        this.setAmazonSettings(amazonSettings);

        return amazonSettings;
    }

    static async validateAmazonSettings(amazonSettings?: AmazonSettings | null): Promise<ResponseDto> {
        const response: ResponseDto = new ResponseDto();
        amazonSettings = amazonSettings ?? this.getAmazonSettings();

        const accountEmailValid = UtilsService.validateEmail(amazonSettings.accountEmail);
        if (!accountEmailValid) response.addError('Invalid format for Amazon Email');

        return response;
    }

    static setSmtpSettings(smtpSettings: SmtpSettings) {
        if (!smtpSettings) return;
        this.getStore().set('smtpSettings', smtpSettings);
    }

    static getSmtpSettings(): SmtpSettings {
        let smtpSettings = this.getStore().get('smtpSettings') as SmtpSettings;
        if (smtpSettings) return smtpSettings;

        smtpSettings = {
            server: 'smtp.gmail.com',
            port: 587,
            from: '',
            fromDisplayName: '',
            email: '',
            password: ''
        };

        this.setSmtpSettings(smtpSettings);

        return smtpSettings;
    }

    static async validateSmtpSettings(smtpSettings?: SmtpSettings | null): Promise<ResponseDto> {
        const response: ResponseDto = new ResponseDto();
        smtpSettings = smtpSettings ?? this.getSmtpSettings();
        const smtpErrors = await UtilsService.validateSmtpSettings(smtpSettings);

        smtpErrors.forEach(error => { response.addError(error); });

        if (response.success && response.messages.length === 0) {
            response.addSuccess('SMTP settings were validated successfully');
        }

        return response;
    }

    static setValue(key: string, value: unknown) {
        this.getStore().set(key, value);
    }

    static getValue(key: string, defaultValue: unknown = null): unknown {
        return this.getStore().get(key, defaultValue);
    }

    static getStore(): ElectronStore<AppSettings> {
        return new Store();
    }
}
