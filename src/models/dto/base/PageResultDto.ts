export default interface PageResultDto<TEntity> {
    data: TEntity[] | undefined;
    page: number;
    pageSize: number;
    totalCount: number;
}
