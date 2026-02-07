/* eslint-disable @typescript-eslint/no-explicit-any */
import './LibraryBook.css'
import { useState, useRef, useEffect } from 'react';
import { Grid, Row, Col, Image, Text, Center, Placeholder } from 'rsuite';
import BookInfoDto from '../../models/dto/BookInfoDto';
import DOMPurify from 'dompurify';

export interface LibraryBookProperties {
    bookId: string | null;
}

const LibraryBook = ({ bookId }: LibraryBookProperties) => {
    const bookInfoRef = useRef(null);
    const bookCoverRef = useRef(null);
    const bookTitleRef = useRef(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [bookInfo, setBookInfo] = useState<BookInfoDto | null>(null);
    const [coverHeight, setCoverHeight] = useState<number>(20);
    const [descriptionHeight, setDescriptionHeight] = useState<number>(20);

    useEffect(() => {
        updateRowHeights();

        if (!bookId) {
            setBookInfo(null);
            return;
        }

        setLoading(true);

        const fetchData = async () => {
            const bookInfo = await window.calibreService.getBookInfo(bookId);

            bookInfo.description = bookInfo.description
                ? DOMPurify.sanitize(bookInfo.description)
                : bookInfo.title;

            setBookInfo(bookInfo);
            setLoading(false);
        };

        setTimeout(() => {
            fetchData();
        }, 750);
    }, [bookId]);

    const updateRowHeights = () => {
        const bookInfoHeight = (bookInfoRef?.current as any)?.offsetHeight;
        const bookCoverHeight = (bookCoverRef?.current as any)?.offsetHeight;
        const bookTitleHeight = (bookTitleRef?.current as any)?.offsetHeight;

        if (bookCoverHeight) {
            setCoverHeight(bookCoverHeight);
        }

        if (bookInfoHeight && bookCoverHeight && bookTitleHeight) {
            const descHeight = bookInfoHeight - bookCoverHeight - bookTitleHeight - 10; //(Margins)
            setDescriptionHeight(descHeight);
        }
    }

    const onImageLoaded = () => {
        updateRowHeights();
    }

    return (
        <>
            <Grid fluid className="book-info" ref={bookInfoRef}>
                <Row ref={bookCoverRef}>
                    <Col span={24}>
                        <Center>
                            {loading && <Placeholder.Graph active style={{ height: `${coverHeight}px` }} />}
                            {!loading && <Image
                                width={'100%'}
                                onLoad={onImageLoaded}
                                src={bookInfo?.coverImageDataUrl
                                    ? bookInfo?.coverImageDataUrl
                                    : 'assets/images/book-cover.jpg'}>
                            </Image>}
                        </Center>
                    </Col>
                </Row>
                <Row mt={10} ref={bookTitleRef}>
                    <Col span={24}>
                        {loading && <>
                            <Placeholder.Paragraph active />
                            <Placeholder.Paragraph active mt={15} />
                        </>}
                        {!loading && <Text
                            size="sm"
                            color="white"
                            align="center"
                            weight="semibold">
                            {bookInfo?.title ?? "Book Title"}
                        </Text>}
                    </Col>
                </Row>
                <Row style={{
                    height: descriptionHeight,
                    maxHeight: descriptionHeight,
                }}>
                    <Col span={24}>
                        {!loading && <Text
                            size="xs"
                            color="white"
                            align="center"
                            weight="regular"
                            className="book-info-description"
                            dangerouslySetInnerHTML={{
                                __html: bookInfo?.description ?? "Book Description"
                            }}
                            style={{
                                height: descriptionHeight,
                                maxHeight: descriptionHeight,
                            }}>
                        </Text>}
                    </Col>
                </Row>
            </Grid>
        </>
    )
}

export default LibraryBook;
