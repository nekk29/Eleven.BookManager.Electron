import { useEffect, useState } from 'react';
import { Grid, Row, Col } from 'rsuite';
import FolderSelector from '../common/FolderSelector';
import Settings from '../../models/settings/CalibreSettings';

export default function CalibreSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            const settings = await window.settingsService.getCalibreSettings();
            setSettings(settings || null);
        }
        fetchSettings();
    }, []);

    const onFolderSelected = async (folderPath: string | null) => {
        if (!settings) return;
        settings.libraryDirectory = folderPath ?? '';
        window.settingsService.setCalibreSettings(settings);
        setSettings({ ...settings });
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>Calibre library location</label>
                    </Col>
                    <Col span={20}>
                        <FolderSelector folderPath={settings?.libraryDirectory || null} onFolderSelected={onFolderSelected} />
                    </Col>
                </Row>
            </Grid>
        </>
    );
}
