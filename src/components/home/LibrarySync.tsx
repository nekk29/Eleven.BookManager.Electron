import './LibrarySync.css';
import { useEffect, useState } from "react";
import { Grid, Row, Col, Button, HStack, Text } from "rsuite";
import ResponseDto from "../../models/dto/base/ResponseBaseDto";
import ResponseNotification from "../common/ResponseNotification";

export interface LibrarySyncProperties {
    onSyncStart: () => void;
    onSyncComplete: () => void;
}

const LibrarySync = ({ onSyncStart, onSyncComplete }: LibrarySyncProperties) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [progressText, setProgressText] = useState('');
    const [progressTextBold, setProgressTextBold] = useState(false);
    const [progressTextColor, setProgressTextColor] = useState('white');
    const [response, setResponse] = useState<ResponseDto | null>(null);

    const onComplete = () => {
        onSyncComplete();
    }

    useEffect(() => {
        window.calibreService.syncBooksProgress((progress: number, total: number) => {
            if (progress === 0) {
                setProgressText(`Starting...`);
            }

            if (progress == total) {
                setProgressTextBold(true);
                setProgressTextColor('green');
                setProgressText('¡ Sync Complete !');

                setTimeout(() => {
                    setProgressTextColor('green');
                    setProgressText('');
                }, 3000);

                setLoading(false);
                onComplete();
            } else {
                const percentage = ((progress / total) * 100).toFixed(2);
                setProgressText(`Syncing ${progress} of ${total} (${percentage}%)`);
            }
        });
    }, []);

    const onSync = async () => {
        onSyncStart();
        setLoading(true);
        setProgressText('');
        setProgressTextBold(false);
        setProgressTextColor('white');

        try {
            const response = await window.calibreService.syncBooks();
            setResponse(response);
            setLoading(false);
            onComplete();
        }
        catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={24}>
                        <HStack className="library-sync">
                            <Text
                                color={progressTextColor}
                                weight={progressTextBold ? 'semibold' : 'regular'}
                                style={{ lineHeight: '36px', textAlign: 'right' }}>
                                {progressText}
                            </Text>
                            <Button
                                ml={10}
                                color="violet"
                                appearance="primary"
                                disabled={loading}
                                onClick={onSync}>
                                Sync From Calibre
                            </Button>
                        </HStack>
                    </Col>
                </Row>
            </Grid>
            <ResponseNotification response={response} />
        </>
    );
}

export default LibrarySync;
