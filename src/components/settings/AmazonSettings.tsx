import { ChangeEvent, useEffect, useState } from 'react';
import { Grid, Row, Col, Input } from 'rsuite';
import Settings from '../../models/settings/AmazonSettings';

export default function AmazonSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            const settings = await window.settingsService.getAmazonSettings();
            setSettings(settings || null);
        }
        fetchSettings();
    }, []);

    const onChange = async (_: string, event: ChangeEvent<HTMLInputElement, Element>) => {
        if (!settings) return;
        settings.accountEmail = event.currentTarget.value;
        window.settingsService.setAmazonSettings(settings);
        setSettings({ ...settings });
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>Amazon email account</label>
                    </Col>
                    <Col span={20}>
                        <Input value={settings?.accountEmail || ''} onChange={onChange} />
                    </Col>
                </Row>
            </Grid>
        </>
    );
}
