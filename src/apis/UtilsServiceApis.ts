import { contextBridge, ipcRenderer } from "electron";

export default class UtilsServiceApis {
    static register(): void {
        contextBridge.exposeInMainWorld('utilsService', {
            async openFolderDialog(): Promise<string | null> {
                return await ipcRenderer.invoke('utilsService:openFolderDialog');
            },
        });
    }
}
