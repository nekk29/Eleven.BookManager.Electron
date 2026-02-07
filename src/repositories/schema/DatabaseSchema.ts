import { idColumn, auditColumns } from './CommonColumns';
import SQLiteSchema from '../sqlite/models/schema/SQLiteSchema';
import { SQLiteType } from '../sqlite/models/schema/SQLiteType';
import { SQLiteTable } from '../sqlite/models/schema/SQLiteTable';

export const DatabaseSchema = {
    tables: [{
        name: "Books",
        columns: [
            idColumn,
            {
                name: "title",
                type: SQLiteType.TEXT,
                required: true,
                default: ""
            },
            {
                name: "normalizedTitle",
                type: SQLiteType.TEXT,
                required: true,
                default: ""
            },
            {
                name: "filePath",
                type: SQLiteType.TEXT,
                required: true,
                default: ""
            },
            {
                name: "sent",
                type: SQLiteType.BOOLEAN,
                required: true,
                default: false
            },
            {
                name: "pending",
                type: SQLiteType.BOOLEAN,
                required: true,
                default: false
            },
            ...auditColumns
        ]
    } as SQLiteTable,

    {
        name: "Authors",
        columns: [
            idColumn,
            {
                name: "name",
                type: SQLiteType.TEXT,
                required: true,
                default: ""
            },
            {
                name: "normalizedName",
                type: SQLiteType.TEXT,
                required: true,
                default: ""
            },
            ...auditColumns
        ]
    } as SQLiteTable,

    {
        name: "AuthorBooks",
        columns: [
            idColumn,
            {
                name: "authorId",
                type: SQLiteType.TEXT,
                required: true
            },
            {
                name: "bookId",
                type: SQLiteType.TEXT,
                required: true
            },
            ...auditColumns
        ]
    } as SQLiteTable]
} as SQLiteSchema;
