import './SmtpSettings.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { Grid, Row, Col, Input, HStack, Button } from 'rsuite';
import Settings from '../../models/settings/SmtpSettings';
import ResponseDto from '../../models/dto/base/ResponseBaseDto';
import ResponseNotification from '../common/ResponseNotification';

export default function SmtpSettings() {
    const [loading, setLoading] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [response, setResponse] = useState<ResponseDto | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            const settings = await window.settingsService.getSmtpSettings();
            setSettings(settings || null);
        }
        fetchSettings();
    }, []);

    const onChange = async (_: string, event: ChangeEvent<HTMLInputElement, Element>, key: string) => {
        if (!settings) return;

        const value = event.currentTarget.value;

        switch (key) {
            case 'server':
                settings.server = value;
                break;
            case 'port':
                settings.port = value ? Number.parseInt(value) : 0;
                break;
            case 'from':
                settings.from = value;
                break;
            case 'fromDisplayName':
                settings.fromDisplayName = value;
                break;
            case 'email':
                settings.email = value;
                break;
            case 'password':
                settings.password = value;
                break;
        }

        window.settingsService.setSmtpSettings(settings);
        setSettings({ ...settings });
    }

    const onTest = () => {
        setLoading(true);
        setResponse(null);

        window.settingsService.validateSmtpSettings()
            .then((response: ResponseDto) => {
                setResponse(response);
                setLoading(false);
            }, (error) => {
                setResponse(null);
                setLoading(false);
                console.error(error);
            });
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>Server</label>
                    </Col>
                    <Col span={8}>
                        <Input value={settings?.server ?? ''} onChange={(_, event) => onChange(_, event, 'server')} />
                    </Col>
                    <Col span={4} style={{ paddingLeft: 40 }}>
                        <label style={{ lineHeight: '36px' }}>Port</label>
                    </Col>
                    <Col span={8}>
                        <Input type='number' value={settings?.port ?? ''} onChange={(_, event) => onChange(_, event, 'port')} />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>From</label>
                    </Col>
                    <Col span={8}>
                        <Input value={settings?.from ?? ''} onChange={(_, event) => onChange(_, event, 'from')} />
                    </Col>
                    <Col span={4} style={{ paddingLeft: 40 }}>
                        <label style={{ lineHeight: '36px' }}>Display name</label>
                    </Col>
                    <Col span={8}>
                        <Input value={settings?.fromDisplayName ?? ''} onChange={(_, event) => onChange(_, event, 'fromDisplayName')} />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={4} style={{ paddingLeft: 0 }}>
                        <label style={{ lineHeight: '36px' }}>Email</label>
                    </Col>
                    <Col span={8}>
                        <Input value={settings?.email ?? ''} onChange={(_, event) => onChange(_, event, 'email')} />
                    </Col>
                    <Col span={4} style={{ paddingLeft: 40 }}>
                        <label style={{ lineHeight: '36px' }}>Password</label>
                    </Col>
                    <Col span={8}>
                        <Input type="password" value={settings?.password ?? ''} onChange={(_, event) => onChange(_, event, 'password')} />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <HStack className="smtp-settings">
                            <Button
                                ml={10}
                                color="violet"
                                appearance="primary"
                                loading={loading}
                                onClick={onTest}>
                                Test Connection
                            </Button>
                        </HStack>
                    </Col>
                </Row>
            </Grid>
            <ResponseNotification response={response} />
        </>
    );
}
