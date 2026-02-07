import { Text, Grid, Row, Col } from 'rsuite';
import LibrarySettings from '../../components/settings/LibrarySettings';
import CalibreSettings from '../../components/settings/CalibreSettings';
import AmazonSettings from '../../components/settings/AmazonSettings';
import SmtpSettings from '../../components/settings/SmtpSettings';

const SettingsPage = () => {
    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={24}>
                        <Text color="violet" size="3xl">Settings</Text>
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Text color="violet" size="xl">Library Settings</Text>
                    </Col>
                </Row>
                <Row mt={10}>
                    <Col span={24}>
                        <LibrarySettings />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Text color="violet" size="xl">Calibre Settings</Text>
                    </Col>
                </Row>
                <Row mt={10}>
                    <Col span={24}>
                        <CalibreSettings />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Text color="violet" size="xl">Amazon Settings</Text>
                    </Col>
                </Row>
                <Row mt={10}>
                    <Col span={24}>
                        <AmazonSettings />
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Text color="violet" size="xl">SMTP Settings</Text>
                    </Col>
                </Row>
                <Row mt={10}>
                    <Col span={24}>
                        <SmtpSettings />
                    </Col>
                </Row>
            </Grid>
        </>
    );
};

export default SettingsPage;
