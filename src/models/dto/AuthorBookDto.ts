import Author from "../entity/Author";
import Book from "../entity/Book";

export default interface AuthorBookDto {
    author: Author;
    books: Book[];
    booksMatching: number;
}
