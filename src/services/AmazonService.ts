import { BrowserWindow } from "electron";
import fs from 'fs';
import Book from "../models/entity/Book";
import UtilsService from "./UtilsService";
import Author from "../models/entity/Author";
import EmailDto from '../models/dto/EmailDto';
import CalibreService from "./CalibreService";
import SettingsService from "./SettingsService";
import AuthorBook from "../models/entity/AuthorBook";
import BookRepository from "../repositories/BookRepository";
import ItemProgressDto from "../models/dto/ItemProgressDto";
import ResponseDto from "../models/dto/base/ResponseBaseDto";
import AuthorRepository from "../repositories/AuthorRepository";
import AuthorBookRepository from "../repositories/AuthorBookRepository";

export default class AmazonService {
    static async sendBook(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        const response = await this.validateConfiguration();
        if (!response.success) return response;

        return await this.processBook(bookId, mainWindows, async (book: Book, authorBook: AuthorBook, response: ResponseDto) => {

            const authorRepository = new AuthorRepository();
            const author = authorRepository.getBy({ id: authorBook.authorId });
            if (!author) {
                response.addError('Author does not exist in library');
                return response;
            }

            const sendResponse = await this.sendBookByEmail(book, author, response);
            if (sendResponse.success) {
                book.sent = true;
                book.pending = false;
            } else {
                response.addMessage(sendResponse.messages[0]);
            }

            return response;
        }, 'Book sent successfully');
    }

    static async sendAuthor(authorId: string, recent: boolean, mainWindows: BrowserWindow): Promise<ResponseDto> {
        const response = await this.validateConfiguration();
        if (!response.success) return response;

        return await this.processAuthor(authorId, recent, mainWindows, (book: Book, author: Author, response: ResponseDto) => {
            book.sent = true;
            book.pending = false;
            return this.sendBookByEmail(book, author, response);
        }, 'Author books sent successfully');

        return response;
    }

    static async markBookAsSent(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return await this.processBook(bookId, mainWindows, async (book: Book, _: AuthorBook, response: ResponseDto) => {
            book.sent = true;
            book.pending = false;
            return response;
        }, 'Book marked as Sent successfully');
    }

    static async markAuthorAsSent(authorId: string, recent: boolean, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return this.processAuthor(authorId, recent, mainWindows, async (book: Book, _: Author, response: ResponseDto) => {
            book.sent = true;
            book.pending = false;
            return response;
        }, 'Author books marked as Sent successfully');
    }

    static async markBookAsUnsent(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return this.processBook(bookId, mainWindows, async (book: Book, _: AuthorBook, response: ResponseDto) => {
            book.sent = false;
            return response;
        }, 'Book marked as Unsent successfully');
    }

    static async markAuthorAsUnsent(authorId: string, recent: boolean, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return this.processAuthor(authorId, recent, mainWindows, async (book: Book, _: Author, response: ResponseDto) => {
            book.sent = false;
            return response;
        }, 'Author books marked as Unsent successfully');
    }

    static async markBookAsPending(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return this.processBook(bookId, mainWindows, async (book: Book, _: AuthorBook, response: ResponseDto) => {
            book.pending = true;
            return response;
        }, 'Book marked as Pending successfully');
    }

    static async markBookAsComplete(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        return this.processBook(bookId, mainWindows, async (book: Book, _: AuthorBook, response: ResponseDto) => {
            book.pending = false;
            return response;
        }, 'Book marked as Complete successfully');
    }

    static async deleteBook(bookId: string, mainWindows: BrowserWindow): Promise<ResponseDto> {
        const bookRepository = new BookRepository();
        const authorRepository = new AuthorRepository();
        const authorBookRepository = new AuthorBookRepository();

        return this.processBook(bookId, mainWindows, async (book: Book, authorBook: AuthorBook, response: ResponseDto) => {
            if (book.sent) {
                response.addError('Book to delete has already been sent');
                return response;
            }

            authorBookRepository.delete(authorBook.id);
            bookRepository.delete(book.id);

            const authorId = authorBook.authorId;
            const authorBooks = authorBookRepository.listBy({ authorId: authorId });

            if (authorBooks?.length == 0)
                authorRepository.delete(authorId);

            return response;
        }, 'Book deleted successfully');
    }

    private static async processBook(bookId: string, mainWindows: BrowserWindow, update: (book: Book, authorBook: AuthorBook, response: ResponseDto) => Promise<ResponseDto>, succesMessage: string): Promise<ResponseDto> {
        const response = new ResponseDto();
        const itemsProgress: ItemProgressDto[] = [];

        itemsProgress.push({ id: bookId, isAuthor: false, isBook: true, message: null });
        this.updateProgress(mainWindows, 0, 1, itemsProgress);

        try {
            const bookRepository = new BookRepository();
            const book = bookRepository.getBy({ id: bookId });

            if (!book) {
                response.addError('Book does not exist in library');
                return response;
            }

            const authorBookRepository = new AuthorBookRepository();
            const authorBook = authorBookRepository.getBy({ bookId: book.id });

            if (!authorBook) {
                response.addError('Book does not exist in library');
                return response;
            }

            const updateResponse = await update(book, authorBook, response);

            if (updateResponse.success) {
                bookRepository.update(book);
                response.addSuccess(succesMessage);
            }
        }
        catch (error) {
            response.addError(`An error has occured processing the book`);
            console.error(error);
        }

        this.updateProgress(mainWindows, 1, 1, []);

        return response;
    }

    private static async processAuthor(authorId: string, recent: boolean, mainWindows: BrowserWindow, update: (book: Book, author: Author, response: ResponseDto) => Promise<ResponseDto>, succesMessage: string): Promise<ResponseDto> {
        const response = new ResponseDto();
        const itemsProgress: ItemProgressDto[] = [];

        itemsProgress.push({ id: authorId, isAuthor: true, isBook: false, message: null });
        this.updateProgress(mainWindows, 0, 1, itemsProgress);

        try {
            const bookRepository = new BookRepository();
            const authorRepository = new AuthorRepository();

            const author = authorRepository.getBy({ id: authorId });
            if (!author) {
                response.addError('Author does not exist in library');
                return response;
            }

            const books = this.getAuthorBooks(authorId, recent) ?? [];

            let index = 0;

            for (const book of books) {
                index++;

                itemsProgress.push({ id: book.id, isAuthor: false, isBook: true, message: null });
                this.updateProgress(mainWindows, index, books.length, itemsProgress);

                const updateResponse = await update(book, author, response);

                if (updateResponse.success) {
                    bookRepository.update(book);
                } else {
                    response.addMessage(updateResponse.messages[0]);
                }

                itemsProgress.pop();
                this.updateProgress(mainWindows, index, books.length, itemsProgress);
            }

            if (response.success)
                response.addSuccess(succesMessage);
        }
        catch (error) {
            response.addError(`An error has occured processing the author`);
            console.error(error);
        }

        this.updateProgress(mainWindows, 1, 1, []);

        return response;
    }

    private static getAuthorBooks(authorId: string, recent: boolean): Book[] | undefined {
        const bookRepository = new BookRepository();
        const authorBookRepository = new AuthorBookRepository();

        const authorBooks = authorBookRepository.listByAuthorIds([authorId]) ?? [];
        const bookIds = authorBooks?.length > 0 ? [...new Set(authorBooks.map(a => a.bookId))] : [];
        const books = bookIds?.length > 0 ? bookRepository.listByIds(bookIds, recent) : [];

        return books;
    }

    private static updateProgress(mainWindows: BrowserWindow, progress: number, total: number, itemsProgress: ItemProgressDto[]) {
        mainWindows.webContents.send('amazonService:notifyProgress', progress, total, itemsProgress);
    }

    private static async validateConfiguration(): Promise<ResponseDto> {
        const amazonValResponse = await SettingsService.validateAmazonSettings();
        if (!amazonValResponse.success) return amazonValResponse;

        const smtpValResponse = await SettingsService.validateSmtpSettings();
        if (!smtpValResponse.success) return smtpValResponse;

        return new ResponseDto();
    }

    private static async sendBookByEmail(book: Book, author: Author, response: ResponseDto): Promise<ResponseDto> {
        const calibreSettings = SettingsService.getCalibreSettings();
        const filePath = CalibreService.getBookAbsolutePath(book.filePath, calibreSettings);

        const bookExists = fs.existsSync(filePath);
        if (!bookExists) {
            response.addError(`Book file "${filePath}" does not exist`);
            return response;
        }

        const amazonSettings = SettingsService.getAmazonSettings();
        const smtpSettings = SettingsService.getSmtpSettings();

        const emailDto = {
            from: smtpSettings.from,
            displayName: smtpSettings.fromDisplayName,
            to: amazonSettings.accountEmail,
            subject: `convert`,
            body: `Book: ${author.name} - ${book.title}`,
            attachments: [{
                filename: `${book.title}.epub`,
                path: filePath
            }]
        } as EmailDto;

        const errors = await UtilsService.sendEmail(emailDto, smtpSettings);

        if (errors.length > 0) {
            response.addError(`An error has occured sending the book`);
            return response;
        }

        return response;
    }
}
