import { useEffect } from 'react';
import { Notification, useToaster } from 'rsuite';
import ResponseDto from '../../models/dto/base/ResponseBaseDto';
import ResponseMessageDto from '../../models/dto/base/ResponseMessageDto';

export interface ResponseNotificationProperties {
    keyPrefix?: string;
    response: ResponseDto | null;
}

const ResponseNotification = ({ response, keyPrefix = 'notification' }: ResponseNotificationProperties) => {
    const toaster = useToaster();

    const getNotification = (message: ResponseMessageDto, index: number) => {
        switch (message.type) {
            case "success":
                return <Notification placement="bottomCenter" closable type="success" key={`${keyPrefix}-${index}-success`}>{message.message}</Notification>;
            case "info":
                return <Notification placement="bottomCenter" closable type="info" key={`${keyPrefix}-${index}-info`}>{message.message}</Notification>;
            case "warning":
                return <Notification placement="bottomCenter" closable type="warning" key={`${keyPrefix}-${index}-warning`}>{message.message}</Notification>;
            case "error":
                return <Notification placement="bottomCenter" closable type="error" key={`${keyPrefix}-${index}-error`}>{message.message}</Notification>;
            default:
                return <Notification placement="bottomCenter" closable type="info" key={`${keyPrefix}-${index}-info`}>{message.message}</Notification>;
        }
    };

    useEffect(() => {
        const messages = response?.messages ?? [];

        messages.forEach((message, index) => {
            const notification = getNotification(message, index);
            toaster.push(notification, { placement: 'topEnd' });
        });

        setTimeout(() => toaster.clear, 2500);
    }, [response]);

    return (<></>)
};

export default ResponseNotification;
