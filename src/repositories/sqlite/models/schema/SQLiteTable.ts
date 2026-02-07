import SQLiteColumn from "./SQLiteColumn";

export interface SQLiteTable {
    name: string;
    columns: SQLiteColumn[];
}
