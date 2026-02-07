import ResponseBaseDto from "./ResponseBaseDto";

export default class ResponseDto<T> extends ResponseBaseDto {
    data: T | null = null;
}
