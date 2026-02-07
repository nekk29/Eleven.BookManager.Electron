import './LayoutComponent.css';
import FolderIcon from '@rsuite/icons/Folder';
import SiteSettingIcon from '@rsuite/icons/SiteSetting';
import HomePage from '../../pages/home/HomePage';
import SettingsPage from '../../pages/settings/SettingsPage';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Breadcrumb,
    Container,
    Content,
    CustomProvider,
    Header,
    HStack,
    Image,
    Nav,
    Sidebar,
    Sidenav,
    Tag,
    VStack
} from 'rsuite';

const Breadcrumbs = () => {
    const location = useLocation();
    console.log(location.pathname);

    return (<Breadcrumb>
        <Breadcrumb.Item>Application</Breadcrumb.Item>
        {location.pathname === '/home' && <Breadcrumb.Item active>Home</Breadcrumb.Item>}
        {location.pathname === '/settings' && <Breadcrumb.Item active>Settings</Breadcrumb.Item>}
    </Breadcrumb>)
};

const LayoutComponent = () => {

    return (
        <CustomProvider theme="dark">
            <Container>
                <Router>
                    <Sidebar h="100vh" width={250} collapsible>
                        <Sidenav w={250}>
                            <Sidenav.Header>
                                <VStack p="10px 10px 0 10px" spacing={12}>
                                    <HStack>
                                        <Image
                                            rounded
                                            src="src/assets/icons/book.png"
                                            alt="My Library"
                                            width={32}
                                        />
                                        <Tag size="lg">
                                            My Library
                                        </Tag>
                                    </HStack>
                                </VStack>
                            </Sidenav.Header>
                            <Sidenav.Body>
                                <Nav>
                                    <Nav.Item panel>
                                        <Sidenav.GroupLabel>Application</Sidenav.GroupLabel>
                                    </Nav.Item>
                                    <Nav.Item as={Link} icon={<FolderIcon />} to="/home">Home</Nav.Item>
                                    <Nav.Item as={Link} icon={<SiteSettingIcon />} to="/settings">Settings</Nav.Item>
                                </Nav>
                            </Sidenav.Body>
                        </Sidenav>
                    </Sidebar>
                    <Container>
                        <Header>
                            <HStack spacing={16} align="center" p="1rem">
                                <Breadcrumbs />
                            </HStack>
                        </Header>
                        <Content px="1rem">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                            </Routes>
                        </Content>
                    </Container>
                </Router>
            </Container>
        </CustomProvider>
    );
}

export default LayoutComponent;
