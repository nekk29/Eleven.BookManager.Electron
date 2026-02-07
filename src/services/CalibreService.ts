import { BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'node:path';
import { Epub } from '@smoores/epub';
import * as cleanTextUtils from 'clean-text-utils';
import Book from '../models/entity/Book';
import Author from '../models/entity/Author';
import SettingsService from './SettingsService';
import LibraryDto from '../models/dto/LibraryDto';
import BookInfoDto from '../models/dto/BookInfoDto';
import AuthorBookDto from '../models/dto/AuthorBookDto';
import ResponseDto from '../models/dto/base/ResponseDto';
import BookRepository from '../repositories/BookRepository';
import { Repository } from '../repositories/base/RepositoryBase';
import SearchParamsDto from '../models/dto/base/SearchParamsDto';
import CalibreSettings from '../models/settings/CalibreSettings';
import AuthorBookFilterDto from '../models/dto/AuthorBookFilterDto';
import AuthorBookRepository from '../repositories/AuthorBookRepository';
import AuthorRepository, { AuthorBookResult } from '../repositories/AuthorRepository';

export default class CalibreService {
    static createOrUpdateDatabase(): ResponseDto<string> {
        const response = new ResponseDto<string>();

        try {
            Repository.createOrUpdateDatabase();
            response.addSuccess('Library data store was initialized successfully');
        }
        catch (error) {
            response.addSuccess('There was an error initializing data store');
            console.error(error);
        }

        return response;
    }

    static async syncBooks(mainWindows: BrowserWindow): Promise<ResponseDto<string>> {
        const response = new ResponseDto<string>();
        const calibreSettings = SettingsService.getCalibreSettings();

        let files = fs.readdirSync(calibreSettings.libraryDirectory,
            {
                encoding: "utf-8",
                withFileTypes: true,
                recursive: true
            })
            .filter(dirent => !dirent.isDirectory() && dirent.name.endsWith('.epub'))
            .map(dirent => path.join(dirent.parentPath, dirent.name));

        files = files.filter(f => !f.includes('.caltrash/'));

        if (files.length === 0) {
            response.addWarning('No books found in the configured calibre directory');
            return response;
        }

        await this.removeMissingBooks();

        mainWindows.webContents.send('calibreService:syncBooks:progress', 0, files.length);

        for (let i = 0; i < files.length; i++) {
            const epub = await Epub.from(files[i]);

            try {
                const filePath = this.getBookRelativePath(files[i], calibreSettings);
                await this.createOrUpdateBook(epub, filePath);
            }
            catch (error) {
                console.error(error);
            }

            mainWindows.webContents.send('calibreService:syncBooks:progress', i + 1, files.length);
        }

        response.addSuccess('Books were synced successfully');

        return response;
    }

    static async removeMissingBooks() {
        const bookRepository = new BookRepository();
        const authorRepository = new AuthorRepository();
        const authorBookRepository = new AuthorBookRepository();
        const calibreSettings = SettingsService.getCalibreSettings();

        const missinBooks: Book[] = [];
        const books = bookRepository.list(99999) ?? [];
        const authorBooks = authorBookRepository.list(99999) ?? [];

        for (const book of books) {
            const filePath = this.getBookAbsolutePath(book.filePath, calibreSettings);
            const bookExists = fs.existsSync(filePath);
            if (!bookExists) missinBooks.push(book);
        }

        for (const book of missinBooks) {
            const missingAuthorBooks = authorBooks.filter(ab => ab.bookId === book.id);
            const authorIds = missingAuthorBooks.map(ab => ab.authorId);

            for (const authorBook of missingAuthorBooks) {
                authorBookRepository.delete(authorBook.id);
            }

            for (const authorId of authorIds) {
                const existinAuthorBooks = authorBooks.filter(ab => ab.authorId === authorId);
                if (existinAuthorBooks.length === 0) {
                    authorRepository.delete(authorId);
                }
            }

            bookRepository.delete(book.id);
        }
    }

    static async createOrUpdateBook(epub: Epub, filePath: string) {
        const title = await epub.getTitle();
        if (!title) return;

        const normalizedTitle = this.normalize(title);
        const creators = await epub.getCreators();
        if (!creators) return;

        const authorIds: string[] = [];
        const authorNames = creators.map(c => c.name);
        const authorNamesNormalized = creators.map(c => this.normalize(c.name));

        const bookRepository = new BookRepository();
        const authorRepository = new AuthorRepository();
        const authorBookRepository = new AuthorBookRepository();

        for (const authorName of authorNames) {
            const normalizedName = this.normalize(authorName);
            const author = authorRepository.getBy({ normalizedName });

            if (!author) {
                const authorId = (authorRepository.add({
                    name: authorName,
                    normalizedName
                })) as string;
                authorIds.push(authorId);
            }
            else {
                authorIds.push(author.id);

                if (author.name !== authorName) {
                    author.name = authorName;
                    author.normalizedName = normalizedName;

                    authorRepository.update(author);
                }
            }
        }

        const addBook = (title: string, normalizedTitle: string, filePath: string): string => {
            return bookRepository.add({
                title,
                normalizedTitle,
                filePath,
                sent: false,
                pending: false
            }) as string;
        }

        const updateBook = (book: Book, title: string, filePath: string): string => {
            if (book.title === title && book.filePath === filePath) return book.id;

            book.title = title;
            book.normalizedTitle = normalizedTitle;
            book.filePath = filePath;

            bookRepository.update(book);
            return book.id;
        }

        const bookIds: string[] = [];
        const books = bookRepository.listBy({ normalizedTitle }) ?? [];

        if (books.length == 0) {
            bookIds.push(addBook(title, normalizedTitle, filePath));
        }
        else {
            const booksIds = books.map(b => b.id);
            const authorBooks = authorBookRepository.listByBookIds(booksIds) ?? [];
            const authorsIds = authorBooks.map(ab => ab.authorId);
            const authors = authorRepository.listByIds(authorsIds) ?? [];
            const author = authors.find(a => authorNamesNormalized.includes(a.normalizedName));

            if (author) {
                const authorBook = authorBooks.find(ab => ab.authorId === author.id);
                const book = books.find(b => b.id === authorBook?.bookId);
                if (book) bookIds.push(updateBook(book, title, filePath));
            }
            else {
                bookIds.push(addBook(title, normalizedTitle, filePath));
            }
        }

        for (const authorId of authorIds) {
            for (const bookId of bookIds) {
                const authorBook = authorBookRepository.getBy({ bookId, authorId });
                if (!authorBook) {
                    (authorBookRepository.add({ bookId, authorId }));
                }
            }
        }
    }

    static normalize(value: string): string {
        if (!value) return value;

        value = cleanTextUtils.strip.emoji(value);
        value = cleanTextUtils.replace.diacritics(value);
        value = cleanTextUtils.replace.exoticChars(value);
        value = cleanTextUtils.replace.smartChars(value);

        return value.toUpperCase();
    }

    static getBookRelativePath(filePath: string, calibreSettings: CalibreSettings): string {
        return filePath.replace(calibreSettings.libraryDirectory, '').replaceAll('\\', "/");
    }

    static getBookAbsolutePath(filePath: string, calibreSettings: CalibreSettings): string {
        return path.join(calibreSettings.libraryDirectory, filePath);
    }

    static listLibrary(params: SearchParamsDto<AuthorBookFilterDto>): LibraryDto {
        const authorBookDtos: AuthorBookDto[] = [];

        const bookRepository = new BookRepository();
        const authorRepository = new AuthorRepository();
        const authorBookRepository = new AuthorBookRepository();

        const searchResult = authorRepository.pageByQuery(
            params.filter.query,
            params.filter.onlyUnsent,
            params.filter.recent
        );

        const allAuthors = searchResult.data ?? [];
        const allAuthorsIds = allAuthors.map(a => a.id);
        const authors = this.paginateAuthors(allAuthors, params.pagination.page, params.pagination.pageSize);
        const authorIds = authors.map(a => a.id);
        const authorBooks = authorIds.length > 0 ? authorBookRepository.listByAuthorIds(authorIds) ?? [] : [];

        const authorsCount = allAuthors.length;
        const booksCount = allAuthorsIds.length > 0 ? bookRepository.countByAuthors(allAuthorsIds, params.filter.onlyUnsent) : 0;

        const bookIds = [...new Set(authorBooks.map(a => a.bookId))];
        const books = bookIds.length > 0 ? bookRepository.listByIds(bookIds, params.filter.recent) ?? [] : [];

        authors.forEach(author => {
            const authorBooksFiltered = authorBooks.filter(ab => ab.authorId === author.id);
            const authorBooksIdsFiltered = authorBooksFiltered.map(ab => ab.bookId);

            let booksFiltered = books.filter(b => authorBooksIdsFiltered.includes(b.id));

            if (params.filter.onlyUnsent) {
                booksFiltered = booksFiltered.filter(b => !b.sent);
            }

            authorBookDtos.push({
                author: { id: author.id, name: author.name } as Author,
                books: booksFiltered,
                booksMatching: booksFiltered.length
            });
        });

        return {
            booksCount,
            authorsCount,
            authorBooks: {
                data: authorBookDtos,
                page: params.pagination.page,
                pageSize: params.pagination.pageSize,
                totalCount: searchResult.totalCount
            }
        };
    }

    static paginateAuthors(dataArray: AuthorBookResult[], page: number, pageSize: number): AuthorBookResult[] {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    }

    static async getBookInfo(bookId: string): Promise<BookInfoDto> {
        const bookRepository = new BookRepository();
        const book = bookRepository.getBy({ id: bookId });

        const bookInfo = {
            title: book?.title,
            description: null,
            coverImageDataUrl: null
        } as BookInfoDto;

        if (!book) return bookInfo;

        const calibreSettings = SettingsService.getCalibreSettings();
        const filePath = this.getBookAbsolutePath(book.filePath, calibreSettings);

        const bookExists = fs.existsSync(filePath);
        if (!bookExists) return bookInfo;

        const epub = await Epub.from(filePath);
        const description = await this.getMetadataValue(epub, 'dc:description') ?? null;

        const coverImage = await epub.getCoverImage();
        const coverImageItem = await epub.getCoverImageItem();
        const coverImageBase64 = coverImage?.buffer ? this.arrayBufferToBase64(coverImage?.buffer) : null;
        const coverImageHref = coverImageItem ? coverImageItem.href : null;
        const coverImageExtension = coverImageHref?.substring(coverImageHref?.lastIndexOf('.') + 1) ?? 'png';

        bookInfo.description = description ?? null;
        bookInfo.coverImageDataUrl = `data:image/${coverImageExtension};base64,${coverImageBase64}`;

        return bookInfo;
    }

    private static async getMetadataValue(epub: Epub, metadataKey: string): Promise<string | undefined> {
        const metadata = await epub.getMetadata();
        return metadata.find(m => m.type === metadataKey)?.value;
    }

    private static arrayBufferToBase64(buffer: ArrayBufferLike): string {
        let binary = '';

        const bytes = new Uint8Array(buffer as ArrayBuffer);
        const len = bytes.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return btoa(binary);
    }
}
