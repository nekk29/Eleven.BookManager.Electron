import { BrowserWindow, IpcMain } from 'electron';
import CalibreService from '../services/CalibreService';
import SearchParamsDto from '../models/dto/base/SearchParamsDto';
import AuthorBookFilterDto from '../models/dto/AuthorBookFilterDto';

export default class CalibreServiceHandlers {
    static register(ipcMain: IpcMain, mainWindows: BrowserWindow): void {
        ipcMain.handle('calibreService:createOrUpdateDatabase', async () => {
            return CalibreService.createOrUpdateDatabase();
        });
        ipcMain.handle('calibreService:syncBooks', async () => {
            return await CalibreService.syncBooks(mainWindows);
        });
        ipcMain.handle('calibreService:listLibrary', async (_, params: SearchParamsDto<AuthorBookFilterDto>) => {
            return CalibreService.listLibrary(params);
        });
        ipcMain.handle('calibreService:getBookInfo', async (_, bookId: string) => {
            return await CalibreService.getBookInfo(bookId);
        });
    }
}
