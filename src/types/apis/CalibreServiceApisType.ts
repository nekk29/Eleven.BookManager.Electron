import LibraryDto from '../../models/dto/LibraryDto';
import BookInfoDto from '../../models/dto/BookInfoDto';
import ResponseDto from '../../models/dto/base/ResponseDto';
import SearchParamsDto from '../../models/dto/base/SearchParamsDto';
import AuthorBookFilterDto from '../../models/dto/AuthorBookFilterDto';

export type CalibreServiceApisType = {
     createOrUpdateDatabase() : Promise<ResponseDto<string>>;
     syncBooks(): Promise<ResponseDto<string>>;
     syncBooksProgress(onProgress: (progress: number, total: number) => void): void;
     listLibrary(params: SearchParamsDto<AuthorBookFilterDto>): Promise<LibraryDto>;
     getBookInfo(bookId: string): Promise<BookInfoDto>;
};
