export interface EmailAttachmentDto {
    filename: string;
    path: string;
}

export default interface EmailDto {
    from: string;
    displayName?: string;
    to: string | string[];
    cc?: string | string[];
    subject: string;
    body: string;
    attachments?: EmailAttachmentDto[];
}
