import SQLiteColumn from "../schema/SQLiteColumn";
import ColumnValue from "./ColumnValue";

export default interface ColumnValueInfo extends ColumnValue {
    columnInfo: SQLiteColumn;
}
