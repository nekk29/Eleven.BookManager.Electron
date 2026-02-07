import ItemProgressDto from '../../models/dto/ItemProgressDto';
import ResponseDto from '../../models/dto/base/ResponseBaseDto';

export type AmazonServiceApisType = {
     sendBook(bookId: string): Promise<ResponseDto>;
     sendAuthor(authorId: string, recent: boolean): Promise<ResponseDto>;
     markBookAsSent(bookId: string): Promise<ResponseDto>;
     markAuthorAsSent(authorId: string, recent: boolean): Promise<ResponseDto>;
     markBookAsUnsent(bookId: string): Promise<ResponseDto>;
     markAuthorAsUnsent(authorId: string, recent: boolean): Promise<ResponseDto>;
     markBookAsPending(bookId: string): Promise<ResponseDto>;
     markBookAsComplete(bookId: string): Promise<ResponseDto>;
     deleteBook(bookId: string): Promise<ResponseDto>;
     notifyProgress(onProgress: (progress: number, total: number, itemsProgress: ItemProgressDto[]) => void): void;
};
