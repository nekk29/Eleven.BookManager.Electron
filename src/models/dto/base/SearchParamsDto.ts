import PageParamsDto from "./PageParamsDto";

export default interface SearchParamsDto<TFilterParams> {
    pagination: PageParamsDto;
    filter: TFilterParams;
}
