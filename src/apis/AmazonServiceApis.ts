import { contextBridge, ipcRenderer } from 'electron';
import ResponseDto from '../models/dto/base/ResponseBaseDto';
import ItemProgressDto from '../models/dto/ItemProgressDto';

export default class AmazonServiceApis {
    static register(): void {
        contextBridge.exposeInMainWorld('amazonService', {
            async sendBook(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:sendBook', bookId);
            },
            async sendAuthor(authorId: string, recent: boolean): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:sendAuthor', authorId, recent);
            },
            async markBookAsSent(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:markBookAsSent', bookId);
            },
            async markAuthorAsSent(authorId: string, recent: boolean): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:markAuthorAsSent', authorId, recent);
            },
            async markBookAsUnsent(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:markBookAsUnsent', bookId);
            },
            async markAuthorAsUnsent(authorId: string, recent: boolean): Promise<ResponseDto> {
                return ipcRenderer.invoke('amazonService:markAuthorAsUnsent', authorId, recent);
            },
            async markBookAsPending(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:markBookAsPending', bookId);
            },
            async markBookAsComplete(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:markBookAsComplete', bookId);
            },
            async deleteBook(bookId: string): Promise<ResponseDto> {
                return await ipcRenderer.invoke('amazonService:deleteBook', bookId);
            },
            async notifyProgress(onProgress: (progress: number, total: number, itemsProgress: ItemProgressDto[]) => void): Promise<void> {
                ipcRenderer.on('amazonService:notifyProgress', (_, progress: number, total: number, itemsProgress: ItemProgressDto[]) => onProgress(progress, total, itemsProgress));
            },
        });
    }
}
