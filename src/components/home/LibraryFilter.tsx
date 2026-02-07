import { useState } from 'react';
import { Grid, Row, Col, InputGroup, Input, HStack, Toggle, Loader } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import AuthorBookFilterDto from '../../models/dto/AuthorBookFilterDto';

export interface LibraryTableProps {
    loading: boolean;
    onChange: (filter: AuthorBookFilterDto) => void;
}

const LibraryFilter = ({ loading, onChange }: LibraryTableProps) => {
    const [useLoader, setUseLoader] = useState<boolean>(false);
    const [filter, setFilter] = useState<AuthorBookFilterDto>({
        query: '',
        onlyUnsent: false,
        recent: false
    });

    let timeoutId: ReturnType<typeof setTimeout>;

    const onChangeQuery = (query: string) => {
        if (timeoutId) { clearTimeout(timeoutId); }

        timeoutId = setTimeout(() => {
            filter.query = query;
            setUseLoader(true);
            setFilter({ ...filter });
            onChange(filter);
        }, 500);
    }

    const onChangeOnlyUnsent = (onlyUnsent: boolean) => {
        filter.onlyUnsent = onlyUnsent;
        setUseLoader(false);
        setFilter({ ...filter });
        onChange(filter);
    }

    const onChangeRecent = (recent: boolean) => {
        filter.recent = recent;
        setUseLoader(false);
        setFilter({ ...filter });
        onChange(filter);
    }

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={12} style={{ paddingLeft: 0 }}>
                        <InputGroup>
                            <Input
                                onChange={(value) => onChangeQuery(value)}
                                placeholder={'Search authors or book titles'} />
                            <InputGroup.Addon>
                                {useLoader
                                    ? (loading ? <Loader /> : <SearchIcon />)
                                    : <SearchIcon />
                                }
                            </InputGroup.Addon>
                        </InputGroup>
                    </Col>
                    <Col span={6}>
                        <HStack spacing={20} style={{ lineHeight: '36px' }}>
                            <Toggle label="Only Unsent" checked={filter.onlyUnsent} onChange={onChangeOnlyUnsent} />
                        </HStack>
                    </Col>
                    <Col span={6}>
                        <HStack spacing={20} style={{ lineHeight: '36px' }}>
                            <Toggle label="Recently Added" checked={filter.recent} onChange={onChangeRecent} />
                        </HStack>
                    </Col>
                </Row>
            </Grid>
        </>
    );
}

export default LibraryFilter;
