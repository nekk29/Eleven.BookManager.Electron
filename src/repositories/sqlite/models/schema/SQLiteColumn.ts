import { SQLiteType } from "./SQLiteType";

export default interface SQLiteColumn {
    isPrimary?: boolean;
    name: string;
    type: SQLiteType;
    length?: number;
    required?: boolean;
    autoIncrement?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default?: any | (() => any);
}
