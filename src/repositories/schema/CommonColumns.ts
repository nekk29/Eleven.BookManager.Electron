import { randomUUID } from 'node:crypto';
import SQLiteColumn from '../sqlite/models/schema/SQLiteColumn';
import { SQLiteType } from '../sqlite/models/schema/SQLiteType';

export const idColumn = {
    name: 'id',
    type: SQLiteType.UUID,
    required: true,
    isPrimary: true,
    default: () => randomUUID(),
} as SQLiteColumn;

export const auditColumns: SQLiteColumn[] = [
    {
        name: "creationUser",
        type: SQLiteType.TEXT,
        length: 64,
        required: true,
        default: "admin"
    },
    {
        name: "creationDate",
        type: SQLiteType.DATETIME,
        required: true,
        default: () => new Date().toISOString()
    },
    {
        name: "updateUser",
        type: SQLiteType.TEXT,
        length: 64,
        required: true,
        default: "admin"
    },
    {
        name: "updateDate",
        type: SQLiteType.DATETIME,
        required: true,
        default: () => new Date().toISOString()
    },
    {
        name: "isActive",
        type: SQLiteType.BOOLEAN,
        required: true,
        default: true
    },
];
