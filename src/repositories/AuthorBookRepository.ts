import RepositoryBase from "./base/RepositoryBase";
import AuthorBook from "../models/entity/AuthorBook";
import Operands from "./sqlite/models/params/Operand";
import FilterBuilder from './sqlite/models/params/FilterBuilder';

export default class AuthorBookRepository extends RepositoryBase<AuthorBook> {
    constructor() {
        super('AuthorBooks');
    }

    listByAuthorIds(authorIds: string[]): AuthorBook[] | undefined {
        const filter = FilterBuilder.In(
            Operands.fromColumn('authorId'),
            authorIds.map(authorId => Operands.fromValue(authorId))
        );

        return this.listByFilter(filter);
    }

    listByBookIds(bookIds: string[]): AuthorBook[] | undefined {
        const filter = FilterBuilder.In(
            Operands.fromColumn('bookId'),
            bookIds.map(bookId => Operands.fromValue(bookId))
        );

        return this.listByFilter(filter);
    }
}
