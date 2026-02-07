import SQLiteEntity from "./SQLiteEntity";

export default interface SQLitePageResult<TEntity extends SQLiteEntity> {
    data: TEntity[] | undefined;
    page: number;
    pageSize: number;
    totalCount: number;
}
