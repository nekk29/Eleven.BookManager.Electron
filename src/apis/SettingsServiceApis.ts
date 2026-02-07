import { contextBridge, ipcRenderer } from "electron";
import ResponseDto from "../models/dto/base/ResponseBaseDto";
import LibrarySettings from "../models/settings/LibrarySettings";
import CalibreSettings from "../models/settings/CalibreSettings";
import AmazonSettings from "../models/settings/AmazonSettings";
import SmtpSettings from "../models/settings/SmtpSettings";

export default class SettingsServiceApis {
    static register(): void {
        contextBridge.exposeInMainWorld('settingsService', {
            async createStore(): Promise<void> {
                await ipcRenderer.invoke('settingsService:createStore');
            },
            async setLibrarySettings(librarySettings: LibrarySettings): Promise<void> {
                await ipcRenderer.invoke('settingsService:setLibrarySettings', librarySettings);
            },
            async getLibrarySettings(): Promise<LibrarySettings> {
                return await ipcRenderer.invoke('settingsService:getLibrarySettings');
            },
            async setCalibreSettings(calibreSettings: CalibreSettings): Promise<void> {
                await ipcRenderer.invoke('settingsService:setCalibreSettings', calibreSettings);
            },
            async getCalibreSettings(): Promise<CalibreSettings> {
                return await ipcRenderer.invoke('settingsService:getCalibreSettings');
            },
            async setAmazonSettings(amazonSettings: AmazonSettings): Promise<void> {
                await ipcRenderer.invoke('settingsService:setAmazonSettings', amazonSettings);
            },
            async getAmazonSettings(): Promise<AmazonSettings> {
                return await ipcRenderer.invoke('settingsService:getAmazonSettings');
            },
            async validateAmazonSettings(amazonSettings?: AmazonSettings | null): Promise<ResponseDto> {
                return await ipcRenderer.invoke('settingsService:validateAmazonSettings', amazonSettings);
            },
            async setSmtpSettings(smtpSettings: SmtpSettings): Promise<void> {
                await ipcRenderer.invoke('settingsService:setSmtpSettings', smtpSettings);
            },
            async getSmtpSettings(): Promise<SmtpSettings> {
                return await ipcRenderer.invoke('settingsService:getSmtpSettings');
            },
            async validateSmtpSettings(smtpSettings?: SmtpSettings | null): Promise<ResponseDto> {
                return await ipcRenderer.invoke('settingsService:validateSmtpSettings', smtpSettings);
            },
            async setValue(key: string, value: unknown): Promise<void> {
                await ipcRenderer.invoke('settingsService:setValue', key, value);
            },
            async getValue(key: string, defaultValue: unknown = null): Promise<unknown> {
                return await ipcRenderer.invoke('settingsService:getValue', key, defaultValue);
            },
        });
    }
}
