import ResponseMessageDto from "./ResponseMessageDto";

export default class ResponseDto {
    success: boolean = true;
    messages: ResponseMessageDto[] = [];

    constructor(message: string | null = null) {
        this.messages = [];
        if (message) this.messages.push({ type: 'success', message });
        this.updateSuccess();
    }

    addSuccess(message: string) {
        this.messages.push({ type: 'success', message });
        this.updateSuccess();
    }

    addInfo(message: string) {
        this.messages.push({ type: 'info', message });
        this.updateSuccess();
    }

    addWarning(message: string) {
        this.messages.push({ type: 'warning', message });
        this.updateSuccess();
    }

    addError(message: string) {
        this.messages.push({ type: 'error', message });
        this.updateSuccess();
    }

    updateSuccess() {
        this.success = (this.messages ?? []).every(m => m.type !== 'error') === true;
    }

    addMessage(message: ResponseMessageDto) {
        if (!message) return;
        this.messages = this.messages ?? [];
        this.messages.push(message);
    }

    clear() {
        this.messages = [];
    }
}
