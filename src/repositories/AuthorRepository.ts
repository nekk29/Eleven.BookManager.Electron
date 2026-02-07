import Author from '../models/entity/Author';
import RepositoryBase from "./base/RepositoryBase";
import Operands from "./sqlite/models/params/Operand";
import SortParam from '../models/entity/base/SortParam';
import PageResultDto from '../models/dto/base/PageResultDto';
import FilterBuilder from "./sqlite/models/params/FilterBuilder";

export interface AuthorBookResult {
    id: string;
    name: string;
}

export default class AuthorRepository extends RepositoryBase<Author> {
    constructor() {
        super('Authors');
    }

    listByIds(ids: string[]): Author[] | undefined {
        const filter = FilterBuilder.In(
            Operands.fromColumn('id'),
            ids.map(id => Operands.fromValue(id))
        );

        return this.listByFilter(filter);
    }

    pageByQuery(query: string, onlyUnsent: boolean, recent: boolean): PageResultDto<AuthorBookResult> {
        const booksSubQuery = this.getBooksSubQuery(query, onlyUnsent);

        let sql = ``;

        sql = `${sql}SELECT\n\t`;
        sql = `${sql}{{COLUMNS}}\n`;
        sql = `${sql}FROM Authors a\n`;
        sql = `${sql}LEFT JOIN(\n\t`;
        sql = `${sql}${booksSubQuery}\n`;
        sql = `${sql}) AS ab ON ab.authorId = a.id\n`;

        const columns: string[] = [
            "a.id",
            "a.name",
            "IFNULL(ab.booksCount, 0) as booksCount",
            "IFNULL(ab.creationDate, a.creationDate) as creationDate",
        ];

        sql = sql.replace('{{COLUMNS}}', columns.join(',\n\t'));

        const booksFilter = FilterBuilder.GreaterThan(
            Operands.fromExpression('booksCount'),
            Operands.fromValue(0)
        );

        const authorFilter = FilterBuilder.Contains(
            Operands.fromExpression('a.normalizedName'),
            Operands.fromValue(query.toUpperCase())
        );

        let filter = FilterBuilder.And([]);
        
        if (onlyUnsent) {
            if (query)
                filter = FilterBuilder.Or([FilterBuilder.And([authorFilter, booksFilter]), booksFilter]);
            else
                filter.filters.push(booksFilter);
        }
        else {
            if (query)
                filter = FilterBuilder.Or([authorFilter, booksFilter]);
            else
                filter.filters.push(booksFilter);
        }

        const sorts: SortParam[] = [];

        if (!recent) {
            sorts.push({
                expression: 'a.normalizedName',
                direction: 'ASC'
            });
        } else {
            sorts.push({
                expression: 'creationDate',
                direction: 'DESC'
            });
        }

        const pageResult = this.client.findPageByFilter<AuthorBookResult>(1, 99999, filter, sorts, sql);

        return pageResult;
    }

    getBooksSubQuery(query: string, onlyUnsent: boolean): string {
        let sql = ``;

        sql = `${sql}SELECT\n\t`;
        sql = `${sql}ab.authorId,\n\t`;
        sql = `${sql}COUNT(1) as booksCount,\n\t`;
        sql = `${sql}MAX(b.creationDate) as creationDate\n`;
        sql = `${sql}FROM Books b\n`;
        sql = `${sql}INNER JOIN AuthorBooks ab on ab.bookId = b.id\n`;

        const filter = FilterBuilder.And([]);

        if (query) {
            filter.filters.push(
                FilterBuilder.Contains(
                    Operands.fromExpression('b.normalizedTitle'),
                    Operands.fromValue(query.toUpperCase())
                )
            );
        }

        if (onlyUnsent) {
            filter.filters.push(FilterBuilder.Equal(
                Operands.fromExpression('b.sent'),
                Operands.fromValue(false)
            ));
        }

        if (filter.filters.length > 0)
            sql = `${sql}WHERE\n\t${filter.render()}`;

        sql = `${sql}\nGROUP BY ab.authorId`;

        return sql.split('\n').join('\n\t');
    }
}
