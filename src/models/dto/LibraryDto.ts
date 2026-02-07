import AuthorBookDto from "./AuthorBookDto";
import PageResultDto from "./base/PageResultDto";

export default interface LibraryDto {
    booksCount: number;
    authorsCount: number;
    authorBooks: PageResultDto<AuthorBookDto>;
}
