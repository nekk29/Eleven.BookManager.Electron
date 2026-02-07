import { BrowserWindow, IpcMain } from "electron";
import SettingsService from "../services/SettingsService";
import ResponseDto from "../models/dto/base/ResponseBaseDto";
import LibrarySettings from "../models/settings/LibrarySettings";
import CalibreSettings from "../models/settings/CalibreSettings";
import AmazonSettings from "../models/settings/AmazonSettings";
import SmtpSettings from "../models/settings/SmtpSettings";

export default class SettingsServiceHandlers {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static register(ipcMain: IpcMain, mainWindows: BrowserWindow): void {
        ipcMain.handle('settingsService:createStore', () => {
            SettingsService.createStore();
        });
        ipcMain.handle('settingsService:setLibrarySettings', (_, librarySettings: LibrarySettings) => {
            SettingsService.setLibrarySettings(librarySettings);
        });
        ipcMain.handle('settingsService:getLibrarySettings', (): LibrarySettings => {
            return SettingsService.getLibrarySettings();
        });
        ipcMain.handle('settingsService:setCalibreSettings', (_, calibreSettings: CalibreSettings) => {
            SettingsService.setCalibreSettings(calibreSettings);
        });
        ipcMain.handle('settingsService:getCalibreSettings', (): CalibreSettings => {
            return SettingsService.getCalibreSettings();
        });
        ipcMain.handle('settingsService:setAmazonSettings', (_, amazonSettings: AmazonSettings) => {
            SettingsService.setAmazonSettings(amazonSettings);
        });
        ipcMain.handle('settingsService:getAmazonSettings', (): AmazonSettings => {
            return SettingsService.getAmazonSettings();
        });
        ipcMain.handle('settingsService:validateAmazonSettings', (_, amazonSettings?: AmazonSettings | null): Promise<ResponseDto> => {
            return SettingsService.validateAmazonSettings(amazonSettings);
        });
        ipcMain.handle('settingsService:setSmtpSettings', (_, smtpSettings: SmtpSettings) => {
            SettingsService.setSmtpSettings(smtpSettings);
        });
        ipcMain.handle('settingsService:getSmtpSettings', (): SmtpSettings => {
            return SettingsService.getSmtpSettings();
        });
        ipcMain.handle('settingsService:validateSmtpSettings', (_, smtpSettings?: SmtpSettings | null): Promise<ResponseDto> => {
            return SettingsService.validateSmtpSettings(smtpSettings);
        });
        ipcMain.handle('settingsService:setValue', (_, key: string, value: unknown) => {
            SettingsService.setValue(key, value);
        });
        ipcMain.handle('settingsService:getValue', (_, key: string, defaultValue: unknown = null) => {
            return SettingsService.getValue(key, defaultValue);
        });
    }
}
