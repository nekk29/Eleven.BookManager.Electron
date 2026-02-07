/* eslint-disable @typescript-eslint/no-explicit-any */
import Book from "../models/entity/Book";
import RepositoryBase from "./base/RepositoryBase";
import Operands from "./sqlite/models/params/Operand";
import SortParam from "../models/entity/base/SortParam";
import FilterBuilder from "./sqlite/models/params/FilterBuilder";

export default class BookRepository extends RepositoryBase<Book> {
    constructor() {
        super('Books');
    }

    countByAuthors(authorIds: string[], onlyUnsent: boolean): number {
        let sql = ``;

        sql = `${sql}SELECT\n\t`;
        sql = `${sql}COUNT(1) as booksCount\n`;
        sql = `${sql}FROM Books b\n`;

        let subQuery = this.getSubQuery(authorIds);

        subQuery = `(${subQuery.split('\n').join('\n\t')})`

        const filter = FilterBuilder.And([
            FilterBuilder.InSubQuery(
                Operands.fromExpression('b.id'),
                Operands.fromExpression(subQuery)
            )]);

        if (onlyUnsent) {
            filter.filters.push(FilterBuilder.Equal(
                Operands.fromExpression('b.sent'),
                Operands.fromValue(false)
            ));
        }

        sql = `${sql}WHERE\n\t${filter.render()}`;

        return (this.client.findOneWithParams(sql, [] as any) as any).booksCount ?? 0;
    }

    private getSubQuery(authorIds: string[]) {
        let sql = ``;

        sql = `${sql}SELECT\n\t`;
        sql = `${sql}ab.bookId\n`;
        sql = `${sql}FROM AuthorBooks ab\n`;

        const filter = FilterBuilder.In(
            Operands.fromExpression('ab.authorId'),
            authorIds.map(authorId => Operands.fromValue(authorId))
        )

        sql = `${sql}WHERE\n\t${filter.render()}`;

        return sql.split('\n').join('\n\t');
    }

    listByIds(ids: string[], recent: boolean): Book[] | undefined {
        const filter = FilterBuilder.In(
            Operands.fromColumn('id'),
            ids.map(id => Operands.fromValue(id))
        );

        const sorts: SortParam[] = [];

        if (!recent) {
            sorts.push({
                expression: 'normalizedTitle',
                direction: 'ASC'
            });
        } else {
            sorts.push({
                expression: 'updateDate',
                direction: 'DESC'
            });
        }

        const page = this.listPageByFilter(1, 999, filter, sorts);

        return page.data;
    }
}
