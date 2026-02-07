import { SQLiteTable } from "./SQLiteTable";

export default interface SQLiteSchema {
    tables: SQLiteTable[];
}
