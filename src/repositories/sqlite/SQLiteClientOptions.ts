import SQLiteSchema from "./models/schema/SQLiteSchema";

export default interface SQLiteClientOptions {
    connectionUri: string;
    schema: SQLiteSchema;
    tableName: string | null;
    verbose?: boolean;
}
