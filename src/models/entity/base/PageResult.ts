export default interface PageResult<TEntity> {
    data: TEntity[] | undefined;
    page: number;
    pageSize: number;
    totalCount: number;
}
