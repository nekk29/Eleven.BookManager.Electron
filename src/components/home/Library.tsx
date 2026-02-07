import { useEffect, useState } from "react";
import { Grid, Row, Col } from 'rsuite';
import LibrarySync from "./LibrarySync";
import LibraryBook from "./LibraryBook";
import LibraryTable from "./LibraryTable";
import LibraryFilter from "./LibraryFilter";
import LibraryDto from "../../models/dto/LibraryDto";
import PageParamsDto from "../../models/dto/base/PageParamsDto";
import ResponseDto from '../../models/dto/base/ResponseBaseDto';
import ResponseNotification from "../common/ResponseNotification";
import SearchParamsDto from "../../models/dto/base/SearchParamsDto";
import AuthorBookFilterDto from "../../models/dto/AuthorBookFilterDto";

const defaultLibrary: LibraryDto = {
  booksCount: 0,
  authorsCount: 0,
  authorBooks: {
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0
  }
};

const Library = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  const [bookId, setBookId] = useState<string | null>(null);
  const [response, setResponse] = useState<ResponseDto | null>(null);

  const [library, setLibrary] = useState<LibraryDto>(defaultLibrary);

  const [searchParams, setSearchParams] = useState<SearchParamsDto<AuthorBookFilterDto>>({
    pagination: {
      page: 1,
      pageSize: 10
    },
    filter: {
      query: '',
      onlyUnsent: false,
      recent: false
    }
  });

  useEffect(() => {
    setLoadingSearch(true);
    setLibrary({ ...defaultLibrary });

    window.calibreService.listLibrary(searchParams)
      .then((libraryResult) => {
        setLibrary({ ...libraryResult });
        setLoadingSearch(false);
      })
      .catch(error => {
        setLoadingSearch(false);
        console.error(error);
      });
  }, [searchParams]);

  const onChangeFilter = (filter: AuthorBookFilterDto) => {
    searchParams.pagination.page = 1;
    searchParams.filter = filter;
    updateSearchParams(searchParams);
  }

  const onChangePagination = (pagination: PageParamsDto) => {
    searchParams.pagination = pagination;
    updateSearchParams(searchParams);
  }

  const onSyncStart = () => {
    setLoading(true);
    updateSearchParams(searchParams);
  }

  const onSyncComplete = () => {
    updateSearchParams(searchParams);
    setLoading(false);
  }

  const onActionComplete = (response: ResponseDto | null) => {
    setResponse(response);

    if (response?.success)
      updateSearchParams(searchParams);
  }

  const onBookClick = async (bookId: string) => {
    setBookId(bookId);
  }

  const updateSearchParams = (searchParams: SearchParamsDto<AuthorBookFilterDto>) => {
    setSearchParams({ ...searchParams });
    setBookId(null);
  }

  return (
    <>
      <Grid fluid>
        <Row>
          <Col span={16} style={{ paddingLeft: 0 }}>
            <LibraryFilter
              loading={loadingSearch}
              onChange={onChangeFilter} />
          </Col>
          <Col span={8}>
            <LibrarySync
              onSyncStart={onSyncStart}
              onSyncComplete={onSyncComplete} />
          </Col>
        </Row>
        <Row mt={20}>
          <Col span={20} style={{ paddingLeft: 0 }}>
            <LibraryTable
              loading={loading}
              library={library}
              filter={searchParams.filter}
              onBookClick={onBookClick}
              onActionComplete={onActionComplete}
              onChangePagination={onChangePagination} />
          </Col>
          <Col span={4} style={{ paddingLeft: 0 }}>
            <LibraryBook bookId={bookId} />
          </Col>
        </Row>
      </Grid>
      <ResponseNotification response={response} />
    </>
  );
};

export default Library;
