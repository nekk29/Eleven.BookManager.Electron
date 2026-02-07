import { BrowserWindow, IpcMain } from 'electron';
import AmazonService from '../services/AmazonService';
import ResponseDto from '../models/dto/base/ResponseBaseDto';

export default class AmazonServiceHandlers {
    static register(ipcMain: IpcMain, mainWindows: BrowserWindow): void {
        ipcMain.handle('amazonService:sendBook', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.sendBook(bookId, mainWindows);
        });
        ipcMain.handle('amazonService:sendAuthor', async (_, authorId: string, recent: boolean): Promise<ResponseDto> => {
            return AmazonService.sendAuthor(authorId, recent, mainWindows);
        });
        ipcMain.handle('amazonService:markBookAsSent', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.markBookAsSent(bookId, mainWindows);
        });
        ipcMain.handle('amazonService:markAuthorAsSent', async (_, authorId: string, recent: boolean): Promise<ResponseDto> => {
            return AmazonService.markAuthorAsSent(authorId, recent, mainWindows);
        });
        ipcMain.handle('amazonService:markBookAsUnsent', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.markBookAsUnsent(bookId, mainWindows);
        });
        ipcMain.handle('amazonService:markAuthorAsUnsent', async (_, authorId: string, recent: boolean): Promise<ResponseDto> => {
            return AmazonService.markAuthorAsUnsent(authorId, recent, mainWindows);
        });
        ipcMain.handle('amazonService:markBookAsPending', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.markBookAsPending(bookId, mainWindows);
        });
        ipcMain.handle('amazonService:markBookAsComplete', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.markBookAsComplete(bookId, mainWindows);
        });
        ipcMain.handle('amazonService:deleteBook', async (_, bookId: string): Promise<ResponseDto> => {
            return AmazonService.deleteBook(bookId, mainWindows);
        });
    }
}
