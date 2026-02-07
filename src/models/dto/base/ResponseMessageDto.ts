export default interface ResponseMessageDto {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
}
