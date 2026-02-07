import { BrowserWindow, IpcMain, IpcMainInvokeEvent } from "electron";
import UtilsService from "../services/UtilsService";

export default class UtilsServiceHandlers {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static register(ipcMain: IpcMain, mainWindows: BrowserWindow): void {
        ipcMain.handle('utilsService:openFolderDialog', async (event: IpcMainInvokeEvent) => {
            return await UtilsService.openFolderDialog(event.sender);
        });
    }
}
