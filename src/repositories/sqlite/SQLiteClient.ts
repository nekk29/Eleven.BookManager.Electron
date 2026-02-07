/* eslint-disable @typescript-eslint/no-explicit-any */

// Current ORM packages in npm were breaking the project dependencies
// So I wrote a small SQLite ORM

import fs from 'fs';
import { DatabaseSync, SQLInputValue, StatementResultingChanges } from 'node:sqlite';

import SQLiteEntity from "./models/base/SQLiteEntity";
import SQLiteClientOptions from './SQLiteClientOptions';

import SQLiteSchema from "./models/schema/SQLiteSchema";
import SQLiteColumn from './models/schema/SQLiteColumn';
import { SQLiteTable } from './models/schema/SQLiteTable';
import { SQLiteType, SQLiteTypesMapping } from './models/schema/SQLiteType';

import SortParam from './models/params/SortParam';
import WhereClause from './models/params/WhereClause';
import ColumnValue from './models/params/ColumnValue';
import { Filter, EmptyFilter } from './models/params/Filter';
import ColumnValueInfo from './models/params/ColumnValueInfo';
import SQLitePageResult from './models/base/SQLitePageResult';

export default class SQLiteClient {
    private options: SQLiteClientOptions;

    constructor(options: SQLiteClientOptions) {
        this.options = options ?? { verbose: false };
    }

    createDatabase(): void {
        const defTables: string[] = [];

        this.iterateTables((table: SQLiteTable) => {
            const defTable = this.getCreateTableSql(table);
            defTables.push(defTable);
        });

        for (const defTable of defTables) {
            this.execute(defTable);
        }
    }

    createOrUpdateDatabase(): void {
        const databaseExists = fs.existsSync(this.options.connectionUri);

        if (!databaseExists) {
            this.createDatabase();
            return;
        }

        const defColumns: string[] = [];

        this.iterateTables((table: SQLiteTable) => {
            const tableRecord = this
                .getDatabase()
                .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${this.escapeLiteral(table.name)}'`)
                .get() as any;

            const tableName = tableRecord?.name;
            if (tableName) {
                const defTable = this.getCreateTableSql(table);
                this.execute(defTable);
                return;
            }

            const existing = this
                .getDatabase()
                .prepare(`PRAGMA table_info(${this.escapeLiteral(table.name)})`)
                .all() as any[];

            const existingColumns = new Set(existing.map(r => r.name));

            this.iterateColumns(table, (column: SQLiteColumn) => {
                if (!existingColumns.has(column.name)) {
                    const type = SQLiteTypesMapping[column.type] || 'TEXT';
                    const length = column.length ? ` (${column.length})` : '';
                    const notNull = column.required ? ' NOT NULL' : '';
                    const defColumn = `ALTER TABLE ${this.escapeIdentifier(table.name)} ADD COLUMN ${this.escapeIdentifier(column.name)} ${type}${length}${notNull}`;

                    defColumns.push(defColumn);;
                }
            });
        });

        for (const defColumn of defColumns) {
            this.execute(defColumn)
        }
    }

    getCreateTableSql(table: SQLiteTable): string {
        const defColumns: string[] = [];

        this.iterateColumns(table, (column: SQLiteColumn) => {
            const type = SQLiteTypesMapping[column.type] || 'TEXT';
            const length = column.length ? ` (${column.length})` : '';
            const notNull = column.required ? ' NOT NULL' : '';
            const pk = column.isPrimary ? ' PRIMARY KEY' : '';

            defColumns.push(`${this.escapeIdentifier(column.name)} ${type}${length}${notNull}${pk}`);
        });

        const defColumn = defColumns.join(',\n\t');
        const defTable = `CREATE TABLE IF NOT EXISTS ${this.escapeIdentifier(table.name)} (\n\t${defColumn}\n)`;

        return defTable;
    }

    insert<TEntity extends SQLiteEntity>(entity: Partial<TEntity>): ColumnValue[] {
        const table = this.getTable();
        const entityObj = entity as any;
        const insertParams: ColumnValueInfo[] = [];
        const primaryKeyValues: ColumnValue[] = [];

        this.iterateColumns(table, (column) => {
            if (column.isPrimary && column.autoIncrement)
                return;

            const hasProperty = Object.hasOwn(entity, column.name);
            if (!hasProperty && !column.default) return;

            let value = entityObj[column.name];

            if (!value) {
                value = typeof column.default === 'function'
                    ? column.default()
                    : column.default;
            }

            value = this.parseValue(value, column.type);

            if (column.isPrimary && value) {
                primaryKeyValues.push({ column: column.name, value: value });
            }

            insertParams.push({
                columnInfo: column,
                column: column.name,
                value: value === false ? '0' : value
            });
        });

        const placeholders = insertParams.map(() => '?').join(',\n\t');
        const defColumn = insertParams.map(p => p.column).join(',\n\t');
        const sql = `INSERT INTO ${table.name} (\n\t${defColumn}\n) VALUES (\n\t${placeholders}\n)`;

        const result = this.executeWithParams(sql, ...insertParams.map(p => p.value));

        return primaryKeyValues.length != 0 ? primaryKeyValues : [{
            column: 'id',
            value: result.lastInsertRowid as any
        }];
    }

    update<TEntity extends SQLiteEntity>(entity: Partial<TEntity>): number {
        const table = this.getTable();
        const whereClause = this.getPkWhereClause(entity);

        const updateColumns = table.columns.filter(c => !c.isPrimary);
        const updateClause = updateColumns.map(c => `${c.name} = ?`).join(',\n\t');

        const entityObj = entity as any;
        const updateValues = updateColumns.map(c => this.parseValue(entityObj[c.name], c.type) as SQLInputValue);

        const sql = `UPDATE ${table.name} SET\n\t${updateClause}\n${whereClause.expression}`;

        return this.executeWithParams(sql, ...updateValues, ...whereClause.params).changes as number;
    }

    private deleteEntity(whereClause: WhereClause): number {
        const table = this.getTable();
        const sql = `DELETE FROM ${table.name}\n${whereClause.expression}`;
        return this.executeWithParams(sql, ...whereClause.params).changes as number;
    }

    delete<TEntity extends SQLiteEntity>(entity: Partial<TEntity>): number {
        const whereClause = this.getPkWhereClause(entity);
        return this.deleteEntity(whereClause);
    }

    deleteBy<TEntity extends SQLiteEntity>(filter: Partial<TEntity>): number {
        const whereClause = this.getByWhereClause(filter);
        return this.deleteEntity(whereClause);
    }

    deleteByFilter(filter: Filter): number {
        const whereClause = this.getFilterWhereClause(filter);
        return this.deleteEntity(whereClause);
    }

    private findOneEntity<TEntity extends SQLiteEntity>(whereClause: WhereClause): TEntity | undefined {
        const table = this.getTable();
        const sql = `SELECT * FROM ${table.name}\n${whereClause.expression} LIMIT 1`;
        return this.findOneWithParams(sql, ...whereClause.params) as TEntity | undefined;
    }

    findOne<TEntity extends SQLiteEntity>(entity: Partial<TEntity>): TEntity | undefined {
        const whereClause = this.getPkWhereClause(entity);
        return this.findOneEntity<TEntity>(whereClause);
    }

    findOneBy<TEntity extends SQLiteEntity>(filter: Partial<TEntity>): TEntity | undefined {
        const whereClause = this.getByWhereClause(filter);
        return this.findOneEntity<TEntity>(whereClause);
    }

    findOneByFilter<TEntity extends SQLiteEntity>(filter: Filter): TEntity | undefined {
        const whereClause = this.getFilterWhereClause(filter);
        return this.findOneEntity<TEntity>(whereClause);
    }

    private findManyEntities<TEntity extends SQLiteEntity>(whereClause: WhereClause): TEntity[] | undefined {
        const table = this.getTable();
        const sql = `SELECT * FROM ${table.name}\n${whereClause.expression}`;
        return this.findManyWithParams(sql, ...whereClause.params) as TEntity[] | undefined;
    }

    findManyBy<TEntity extends SQLiteEntity>(filter: Partial<TEntity>): TEntity[] | undefined {
        const whereClause = this.getByWhereClause(filter);
        return this.findManyEntities<TEntity>(whereClause);
    }

    findManyByFilter<TEntity extends SQLiteEntity>(filter: Filter): TEntity[] | undefined {
        const whereClause = this.getFilterWhereClause(filter);
        return this.findManyEntities<TEntity>(whereClause);
    }

    private findPageEntities<TEntity extends SQLiteEntity>(page: number, pageSize: number, whereClause: WhereClause, sorts: SortParam[], selectSql: string | null = null): SQLitePageResult<TEntity> {
        const table = this.getTable();

        page = page ?? 1;
        page = page <= 0 ? 1 : page;
        pageSize = pageSize ?? 10;
        pageSize = pageSize <= 0 ? 10 : pageSize;
        selectSql = selectSql ?? `SELECT * FROM ${table.name}`;

        // Count SQL Query
        const fromIndex = this.getFromIndex(selectSql);
        const countSql = `SELECT COUNT(1) AS totalCount ${selectSql.substring(fromIndex)}\n${whereClause.expression}`;
        const totalCount = (this.findOneWithParams(countSql, ...whereClause.params) as any).totalCount;

        // Sort SQL Query
        let sortSql = "";
        if (sorts) {
            if (sorts.length > 0) {
                const sortsExp = sorts.map(s => `${s.expression} ${s.direction}`).join(' ,\n\t');
                sortSql = `ORDER BY\n\t${sortsExp}`
            }
        }

        // Page SQL Query
        const offset = (page - 1) * pageSize;
        const pageSql = `LIMIT ${pageSize} OFFSET ${offset};`;

        // Data SQL Query
        const dataSql = `${selectSql}\n${whereClause.expression}\n${sortSql}\n${pageSql}`;
        const data = this.findManyWithParams(dataSql, ...whereClause.params) as TEntity[] | undefined;

        return {
            data,
            page,
            pageSize,
            totalCount
        }
    }

    private getFromIndex(sql: string): number {
        let selectIndex = sql.indexOf("SELECT");
        if (selectIndex < 0) throw Error('SELECT clause not found in query');

        const selectIndexes: number[] = [selectIndex];
        const selectKeyWord = "SELECT";
        const selectPlaceHolder = selectKeyWord.replace(/./g, '#');

        const fromKeyWord = "FROM";
        const fromPlaceHolder = fromKeyWord.replace(/./g, '#');

        let fromIndex: number = -1;
        let sqlCopy = `${sql}`.replace(selectKeyWord, selectPlaceHolder);

        while (sqlCopy.includes(fromKeyWord)) {
            selectIndex = sqlCopy.indexOf(selectKeyWord);
            fromIndex = sqlCopy.indexOf(fromKeyWord);

            if (selectIndex > 0 && selectIndex < fromIndex) {
                sqlCopy = `${sqlCopy.replace(selectKeyWord, selectPlaceHolder)}`;
                selectIndexes.push(selectIndex);
            }

            sqlCopy = `${sqlCopy.replace(fromKeyWord, fromPlaceHolder)}`;
            selectIndexes.pop();

            if (selectIndexes.length == 0) break;
        }

        if (fromIndex === -1) throw Error('Query statement has structure errors');

        return fromIndex;
    }

    findPageBy<TEntity extends SQLiteEntity>(page: number, pageSize: number, filter: Partial<TEntity>, sorts: SortParam[], selectSql: string | null = null): SQLitePageResult<TEntity> {
        const whereClause = this.getByWhereClause(filter);
        return this.findPageEntities(page, pageSize, whereClause, sorts, selectSql);
    }

    findPageByFilter<TEntity extends SQLiteEntity>(page: number, pageSize: number, filter: Filter, sorts: SortParam[], selectSql: string | null = null): SQLitePageResult<TEntity> {
        const whereClause = this.getFilterWhereClause(filter);
        return this.findPageEntities(page, pageSize, whereClause, sorts, selectSql);
    }

    findAll<TEntity extends SQLiteEntity>(limit: number = 1000): TEntity[] | undefined {
        const table = this.getTable();
        const sql = `SELECT * FROM ${table.name} LIMIT ${limit}`;
        return this.findManyWithParams(sql, [] as any) as TEntity[] | undefined;
    }

    private countEntities(whereClause: WhereClause): number {
        const table = this.getTable();
        const sql = `SELECT COUNT(1) as totalCount FROM ${table.name}\n${whereClause.expression}`;
        return (this.findOneWithParams(sql, ...whereClause.params) as any)?.totalCount as number ?? 0;
    }

    countBy<TEntity extends SQLiteEntity>(filter: Partial<TEntity>): number {
        const whereClause = this.getByWhereClause(filter);
        return this.countEntities(whereClause);
    }

    countByFilter(filter: Filter): number {
        const whereClause = this.getFilterWhereClause(filter);
        return this.countEntities(whereClause);
    }

    // Basic identifier escaping using double quotes
    private escapeIdentifier(id: string) {
        return `"${id.replace(/"/g, '""')}"`;
    }

    // For PRAGMA usage in table_info we can just use the literal as-is but keep simple escaping
    private escapeLiteral(lit: string) {
        return lit.replace(/'/g, "''");
    }

    private getTable(): SQLiteTable {
        if (!this.options.tableName) throw new Error('Table name is not specified');

        const table = this.options.schema.tables.find(t => t.name === this.options.tableName);
        if (!table) throw new Error(`Table ${this.options.tableName} not found in schema`);

        return table;
    }

    private parseValue(value: unknown, columnType: string): unknown {
        if (value === null || value === undefined) return value;

        switch (columnType) {
            case SQLiteType.BOOLEAN:
                value = +Boolean(value)
                break;
            case SQLiteType.DATETIME:
                value = new Date(`${value}`).toISOString();
                break;
            case SQLiteType.UUID:
                value = `${value}`;
                break;
        }

        return value === false ? '0' : value;
    }

    private getPrimaryKeys<TEntity extends SQLiteEntity>(table: SQLiteTable, entity: TEntity): ColumnValueInfo[] {
        const primaryKeys: ColumnValueInfo[] = [];
        const keyColumns = table.columns.filter(c => c.isPrimary);

        if (keyColumns.length === 0)
            throw new Error(`No primary key defined for table ${table.name}`);

        const entityObj = entity as any;

        for (const keyColumn of keyColumns) {
            const hasProperty = Object.hasOwn(entity, keyColumn.name);
            if (!hasProperty)
                throw new Error(`Column ${keyColumn.name} not present in object`);

            const value = entityObj[keyColumn.name];
            if (!value)
                throw new Error(`Column value for property ${keyColumn} is empty`);

            primaryKeys.push({ columnInfo: keyColumn, column: keyColumn.name, value });
        }

        return primaryKeys;
    }

    private getFilterKeys<TEntity extends SQLiteEntity>(table: SQLiteTable, filter: TEntity): ColumnValueInfo[] {
        if (!filter) throw new Error('Fiters are required');

        const valueKeys: ColumnValueInfo[] = [];
        const columns = table.columns;
        const filtersObj = filter as any;

        Object.keys(filter).forEach(key => {
            const column = columns.find(c => c.name === key);
            if (!column) throw new Error(`Column ${key} not present in table schema`);
            valueKeys.push({ columnInfo: column, column: key, value: filtersObj[key] });
        });

        return valueKeys;
    }

    private getWhereClause(columnParams: ColumnValueInfo[]): WhereClause {
        if (!columnParams) return { expression: '', params: [] };
        if (columnParams.length <= 0) return { expression: '', params: [] };

        const conditions = columnParams.map(c => `${c.column} = ?`).join(' AND\n\t');
        const expression = `WHERE\n\t${conditions}`;
        const params = columnParams.map(c => {
            let value = c.value;
            value = this.parseValue(c.value, c.columnInfo.type);
            return value === false ? '0' : value
        });

        return { expression, params } as WhereClause;
    }

    private getPkWhereClause<TEntity extends SQLiteEntity>(entity: Partial<TEntity>): WhereClause {
        const table = this.getTable();
        const primaryKeys = this.getPrimaryKeys(table, entity);
        return this.getWhereClause(primaryKeys);
    }

    getByWhereClause<TEntity extends SQLiteEntity>(filter: Partial<TEntity>): WhereClause {
        const table = this.getTable();
        const filterKeys = this.getFilterKeys(table, filter);
        return this.getWhereClause(filterKeys);
    }

    getFilterWhereClause(filter: Filter): WhereClause {
        if (!filter) return { expression: '', params: [] };
        if (filter instanceof EmptyFilter) return { expression: '', params: [] };

        const conditions = filter.render();
        const expression = conditions ? `WHERE\n\t${conditions}` : '';

        return { expression, params: [] } as WhereClause;
    }

    private iterateTables(tableAction: (table: SQLiteTable) => void) {
        const tables: SQLiteTable[] = (this.options.schema && (this.options.schema as SQLiteSchema).tables) || [];
        for (const table of tables) {
            tableAction(table);
        }
    }

    private iterateColumns(table: SQLiteTable, columnAction: (column: SQLiteColumn) => void) {
        const columns: SQLiteColumn[] = table.columns || [];
        for (const column of columns) {
            columnAction(column);
        }
    }

    execute(sql: string) {
        try {
            if (this.options.verbose) this.printSql(sql);
            const db = this.getDatabase();
            db.prepare(sql).run();
        } catch (error) {
            this.printSql(sql);
            throw error;
        }
    }

    executeWithParams(sql: string, ...params: SQLInputValue[]): StatementResultingChanges {
        try {
            if (this.options.verbose) this.printSql(sql);
            return params
                ? this.getDatabase().prepare(sql).run(...params)
                : this.getDatabase().prepare(sql).run();
        } catch (error) {
            this.printSql(sql);
            throw error;
        }
    }

    findOneWithParams(sql: string, ...params: SQLInputValue[]): unknown | undefined {
        try {
            if (this.options.verbose) this.printSql(sql);
            return params
                ? this.getDatabase().prepare(sql).get(...params)
                : this.getDatabase().prepare(sql).get();
        } catch (error) {
            this.printSql(sql);
            throw error;
        }
    }

    findManyWithParams(sql: string, ...params: SQLInputValue[]): unknown[] {
        try {
            if (this.options.verbose) this.printSql(sql);
            return params
                ? this.getDatabase().prepare(sql).all(...params)
                : this.getDatabase().prepare(sql).all();
        } catch (error) {
            this.printSql(sql);
            throw error;
        }
    }

    private printSql(sql: string) {
        console.info('----------------------------------------------------------');
        console.info(sql);
    }

    private getDatabase() {
        return new DatabaseSync(this.options.connectionUri);
    }
}
