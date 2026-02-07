import './LibraryTable.css';
import * as cleanTextUtils from 'clean-text-utils';
import { useEffect, useMemo, useState } from 'react';
import LibraryDto from '../../models/dto/LibraryDto';
import { PaginationLocale } from 'rsuite/esm/locales/index';
import ItemProgressDto from '../../models/dto/ItemProgressDto';
import PageParamsDto from '../../models/dto/base/PageParamsDto';
import ResponseDto from '../../models/dto/base/ResponseBaseDto';
import AuthorBookFilterDto from '../../models/dto/AuthorBookFilterDto';
import { Grid, Row, Col, Table, Button, Image, Pagination, Loader } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

interface LibraryRow {
    id: string;
    isAuthor: boolean;
    isBook: boolean;
    label: string;
    sent: boolean;
    pending: boolean;
    alphabetImage?: string | null;
    children: LibraryRow[];
}

export interface LibraryTableProps {
    loading: boolean;
    library: LibraryDto;
    filter: AuthorBookFilterDto;
    onChangePagination: (pagination: PageParamsDto) => void;
    onActionComplete: (response: ResponseDto | null) => void;
    onBookClick: (bookId: string) => void;
}

const LibraryTable = ({ loading, library, filter, onChangePagination, onActionComplete, onBookClick }: LibraryTableProps) => {
    const [itemsProgress, setItemsProgress] = useState<ItemProgressDto[]>([]);

    useEffect(() => {
        window.amazonService.notifyProgress((_: number, __: number, itemsProgress: ItemProgressDto[]) => {
            setItemsProgress(itemsProgress);
        });
    }, []);

    const locale: PaginationLocale = useMemo(() => {
        return {
            total: `Total: ${library.authorsCount ?? 0} Authors, ${library.booksCount ?? 0} Books`,
        } as PaginationLocale;
    }, [library]);

    const onChangeLimit = (limit: number) => {
        onChangePagination({ page: library.authorBooks.page ?? 1, pageSize: limit });
    };

    const onChangePage = (page: number) => {
        onChangePagination({ page, pageSize: library.authorBooks.pageSize ?? 10 });
    };

    const normalize = (value: string): string => {
        if (!value) return value;

        value = cleanTextUtils.strip.emoji(value);
        value = cleanTextUtils.replace.diacritics(value);
        value = cleanTextUtils.replace.exoticChars(value);
        value = cleanTextUtils.replace.smartChars(value);

        return value.toUpperCase();
    }

    const getAuthorLetterImage = (name: string): string => {
        let letter = "symbol";
        if (name) letter = normalize(name.charAt(0)).toLowerCase();
        return `assets/icons/alphabet/letter_${letter}.png`;
    }

    const getFilterQuery = (query: string): string => {
        return query
            .replaceAll('(', '\\(')
            .replaceAll(')', '\\)')
            .replaceAll('*', '\\*')
            .replaceAll('^', '\\^')
            .replaceAll('$', '\\$')
            .replaceAll('.', '\\.');
    }

    const processAction = async (id: string, isBook: boolean, action: () => Promise<ResponseDto>, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();

        itemsProgress.push({ id, isBook, isAuthor: !isBook, message: 'Processing...' });
        setItemsProgress([...itemsProgress]);
        const itemsProgresFiltered = itemsProgress.filter(i => i.id !== id);

        try {
            const response = await action();
            setItemsProgress([...itemsProgresFiltered]);
            onActionComplete(response);
        }
        catch (error) {
            setItemsProgress([...itemsProgresFiltered]);
            onActionComplete({
                messages: [{
                    type: 'error',
                    message: 'Error performing the operation'
                }]
            } as ResponseDto);

            console.error(error);
        }
    }

    const sendBook = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.sendBook(bookId);
        }, event);
    }

    const sendAuthor = (authorId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(authorId, false, async (): Promise<ResponseDto> => {
            return await window.amazonService.sendAuthor(authorId, filter.recent);
        }, event);
    }

    const markBookAsSent = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.markBookAsSent(bookId);
        }, event);
    }

    const markAuthorAsSent = (authorId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(authorId, false, async (): Promise<ResponseDto> => {
            return await window.amazonService.markAuthorAsSent(authorId, filter.recent);
        }, event);
    }

    const markBookAsUnsent = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.markBookAsUnsent(bookId);
        }, event);
    }

    const markAuthorAsUnsent = (authorId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(authorId, false, async (): Promise<ResponseDto> => {
            return await window.amazonService.markAuthorAsUnsent(authorId, filter.recent);
        }, event);
    }

    const markBookAsPending = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.markBookAsPending(bookId);
        }, event);
    }

    const markBookAsComplete = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.markBookAsComplete(bookId);
        }, event);
    }

    const deleteBook = (bookId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        processAction(bookId, true, async (): Promise<ResponseDto> => {
            return await window.amazonService.deleteBook(bookId);
        }, event);
    }

    const onRowClick = (rowData: LibraryRow) => {
        if (rowData.isAuthor) return;
        onBookClick(rowData.id);
    }

    const activePage: number = useMemo((): number => {
        return library.authorBooks.page ?? 1;
    }, [library]);

    const limit: number = useMemo((): number => {
        return library.authorBooks.pageSize ?? 10;
    }, [library]);

    const total: number = useMemo((): number => {
        return library.authorBooks.totalCount ?? 0;
    }, [library]);

    const libraryData: LibraryRow[] = useMemo((): LibraryRow[] => {
        const libraryData: LibraryRow[] = [];
        let currentAlphabetImage: string | null = null;

        (library.authorBooks?.data ?? []).forEach(authorBookDto => {
            const author = authorBookDto.author;
            const books = authorBookDto.books ?? [];

            const authorSent = books.every(b => b.sent);
            const authorPending = books.every(b => b.pending);

            const bookRows: LibraryRow[] = books.map(books => {
                return {
                    id: books.id,
                    isAuthor: false,
                    isBook: true,
                    label: books.title,
                    sent: books.sent,
                    pending: books.pending,
                    children: []
                } as LibraryRow;
            });

            let authorAlphabetImage: string | null = getAuthorLetterImage(author.name);
            if (authorAlphabetImage !== currentAlphabetImage)
                currentAlphabetImage = authorAlphabetImage;
            else
                authorAlphabetImage = null;

            libraryData.push({
                id: author.id,
                isAuthor: true,
                isBook: false,
                label: author.name,
                sent: authorSent,
                pending: authorPending,
                alphabetImage: authorAlphabetImage,
                children: bookRows
            });
        });

        return libraryData;
    }, [library]);

    return (
        <>
            <Grid fluid>
                <Row>
                    <Col span={24} style={{ paddingLeft: 0 }}>
                        <Table
                            isTree
                            bordered
                            rowKey="id"
                            height={462}
                            headerHeight={0}
                            data={libraryData}
                            shouldUpdateScroll={false}
                            onRowClick={onRowClick}
                            renderTreeToggle={(_: React.ReactNode, rowData?: LibraryRow, expanded?: boolean) => {
                                return (
                                    <>
                                        {rowData?.isAuthor && (expanded
                                            ? <Image
                                                width={28}
                                                src='assets/icons/actions/expand.png'>
                                            </Image>
                                            : <Image
                                                width={28}
                                                src='assets/icons/actions/collapse.png'>
                                            </Image>
                                        )}
                                    </>
                                )
                            }}>
                            <Column width={95}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-alphabet'>
                                    {(rowData: LibraryRow) =>
                                        <>
                                            {rowData.alphabetImage && <Image
                                                width={28}
                                                className='library-alphabet-icon'
                                                src={rowData.alphabetImage}>
                                            </Image>}
                                        </>
                                    }
                                </Cell>
                            </Column>
                            <Column width={34}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-icon'>
                                    {(rowData: LibraryRow) =>
                                        <>
                                            {rowData.isAuthor && <Image
                                                width={24}
                                                style={{ paddingTop: '2px' }}
                                                src='assets/icons/table/author.png'>
                                            </Image>
                                            }
                                            {rowData.isBook && <Image
                                                width={24}
                                                src='assets/icons/table/book.png'>
                                            </Image>
                                            }
                                        </>
                                    }
                                </Cell>
                            </Column>
                            <Column flexGrow={1}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-label'>
                                    {(rowData: LibraryRow) => <>
                                        <div
                                            color="white"
                                            className={rowData.isAuthor ? 'bold' : ''}
                                            dangerouslySetInnerHTML={filter.query
                                                ? { __html: rowData.label.replace(new RegExp(`(${getFilterQuery(filter.query)})`, 'gi'), '<mark>$1</mark>') }
                                                : { __html: rowData.label }}>
                                        </div>
                                    </>}
                                </Cell>
                            </Column>
                            <Column width={40}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-loader'>
                                    {(rowData: LibraryRow) => {
                                        return itemsProgress.find(i => i.id == rowData.id) && <Loader />
                                    }}
                                </Cell>
                            </Column>
                            <Column width={45}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-status'>
                                    {(rowData: LibraryRow) => {
                                        if (rowData.isAuthor) return <></>
                                        if (rowData.sent) {
                                            return (
                                                <Image
                                                    width={24}
                                                    alt='Sent'
                                                    title='Sent'
                                                    src='assets/icons/actions/checked.png'>
                                                </Image>
                                            )
                                        } else {
                                            return (
                                                <Image
                                                    width={24}
                                                    style={{ cursor: 'pointer' }}
                                                    alt={rowData.pending ? 'Mark As Complete' : 'Mark As Pending'}
                                                    title={rowData.pending ? 'Mark As Complete' : 'Mark As Pending'}
                                                    src={rowData.pending
                                                        ? 'assets/icons/actions/exclamation.png'
                                                        : 'assets/icons/actions/warning.png'
                                                    }
                                                    onClick={itemsProgress.some(i => i.id == rowData.id) || loading ? () => { } : (rowData.pending
                                                        ? (event) => markBookAsComplete(rowData.id, event)
                                                        : (event) => markBookAsPending(rowData.id, event))}>
                                                </Image>
                                            )
                                        }
                                    }}
                                </Cell>
                            </Column>
                            <Column width={65}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-actions'>
                                    {(rowData: LibraryRow) => <>
                                        <Button
                                            size="sm"
                                            width={55}
                                            color="green"
                                            appearance="primary"
                                            disabled={itemsProgress.some(i => i.id == rowData.id) || loading || rowData.sent}
                                            onClick={rowData.isAuthor
                                                ? (event) => sendAuthor(rowData.id, event)
                                                : (event) => sendBook(rowData.id, event)}>
                                            Send
                                        </Button>
                                    </>}
                                </Cell>
                            </Column>
                            <Column width={125}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-actions'>
                                    {(rowData: LibraryRow) => <>
                                        <Button
                                            size="sm"
                                            width={115}
                                            color="blue"
                                            disabled={itemsProgress.some(i => i.id == rowData.id) || loading}
                                            appearance={rowData.sent ? "default" : "primary"}
                                            onClick={rowData.isAuthor
                                                ? (rowData.sent ? (event) => markAuthorAsUnsent(rowData.id, event) : (event) => markAuthorAsSent(rowData.id, event))
                                                : (rowData.sent ? (event) => markBookAsUnsent(rowData.id, event) : (event) => markBookAsSent(rowData.id, event))
                                            }>
                                            {rowData.sent ? 'Mark As Unsent' : 'Mark As Sent'}
                                        </Button>
                                    </>}
                                </Cell>
                            </Column>
                            <Column width={80}>
                                <HeaderCell>{''}</HeaderCell>
                                <Cell className='library-actions' style={{ paddingRight: '20px' }}>
                                    {(rowData: LibraryRow) => <>
                                        <Button
                                            size="sm"
                                            width={55}
                                            color="red"
                                            appearance={rowData.isAuthor || rowData.sent ? "default" : "primary"}
                                            disabled={itemsProgress.some(i => i.id == rowData.id) || loading || rowData.isAuthor || rowData.sent}
                                            style={{ color: rowData.isAuthor ? 'transparent' : 'inherit' }}
                                            onClick={rowData.isAuthor ? () => { } : (event) => deleteBook(rowData.id, event)}>
                                            Delete
                                        </Button>
                                    </>}
                                </Cell>
                            </Column>
                        </Table>
                    </Col>
                </Row>
                <Row mt={20}>
                    <Col span={24}>
                        <Pagination
                            className='library-paginator'
                            layout={['total', '-', 'limit', '|', 'pager']}
                            size="sm"
                            prev={true}
                            next={true}
                            first={true}
                            last={true}
                            ellipsis={true}
                            boundaryLinks={true}
                            limit={limit}
                            total={total}
                            limitOptions={[10, 25, 50, 100]}
                            maxButtons={5}
                            activePage={activePage}
                            onChangePage={onChangePage}
                            onChangeLimit={onChangeLimit}
                            locale={locale}
                        />
                    </Col>
                </Row>
            </Grid>
        </>
    );
}

export default LibraryTable;
