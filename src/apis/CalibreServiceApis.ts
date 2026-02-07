import { contextBridge, ipcRenderer } from 'electron';
import LibraryDto from '../models/dto/LibraryDto';
import BookInfoDto from '../models/dto/BookInfoDto';
import ResponseDto from '../models/dto/base/ResponseDto';
import SearchParamsDto from '../models/dto/base/SearchParamsDto';
import AuthorBookFilterDto from '../models/dto/AuthorBookFilterDto';

export default class CalibreServiceApis {
    static register(): void {
        contextBridge.exposeInMainWorld('calibreService', {
            async createOrUpdateDatabase(): Promise<ResponseDto<string>> {
                return await ipcRenderer.invoke('calibreService:createOrUpdateDatabase');
            },
            async syncBooks(): Promise<ResponseDto<string>> {
                return await ipcRenderer.invoke('calibreService:syncBooks');
            },
            async syncBooksProgress(onProgress: (progress: number, total: number) => void): Promise<void> {
                ipcRenderer.on('calibreService:syncBooks:progress', (_, progress: number, total: number) => onProgress(progress, total));
            },
            async listLibrary(params: SearchParamsDto<AuthorBookFilterDto>): Promise<LibraryDto> {
                return await ipcRenderer.invoke('calibreService:listLibrary', params);
            },
            async getBookInfo(bookId: string): Promise<BookInfoDto> {
                return await ipcRenderer.invoke('calibreService:getBookInfo', bookId);
            },
        });
    }
}
