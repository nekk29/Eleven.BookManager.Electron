import { useEffect, useState } from 'react';
import { Grid, Row, Col } from 'rsuite';
import FolderSelector from '../common/FolderSelector';
import Settings from '../../models/settings/LibrarySettings';
import ResponseDto from '../../models/dto/base/ResponseBaseDto';
import ResponseNotification from '../common/ResponseNotification';

export default function LibrarySettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [response, setResponse] = useState<ResponseDto | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            const settings = await window.settingsService.getLibrarySettings();
            setSettings(settings || null);
        }
        fetchSettings();
    }, []);

    const onFolderSelected = async (folderPath: string | null) => {
        if (!settings) return;

        const workingDirectory = folderPath ?? '';

        if (settings.workingDirectory !== workingDirectory) {
            settings.workingDirectory = workingDirectory;
            window.settingsService.setLibrarySettings(settings);
            const response = await window.calibreService.createOrUpdateDatabase();
            setResponse(response);
            setSettings({ ...settings });
        }
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>Application data location</label>
                    </Col>
                    <Col span={20}>
                        <FolderSelector folderPath={settings?.workingDirectory || null} onFolderSelected={onFolderSelected} />
                    </Col>
                </Row>
            </Grid>
            <ResponseNotification response={response} />
        </>
    );
}
