import { useEffect } from 'react';
import { Text, Grid, Row, Col } from 'rsuite';
import Library from "../../components/home/Library";

const HomePage = () => {
    useEffect(() => {
        const fetchData = async () => {
            await window.settingsService.createStore();
        };

        fetchData();
    }, []);

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={24}>
                        <Text color="violet" size="3xl">Home</Text>
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Library />
                    </Col>
                </Row>
            </Grid>
        </>
    );
};

export default HomePage;
