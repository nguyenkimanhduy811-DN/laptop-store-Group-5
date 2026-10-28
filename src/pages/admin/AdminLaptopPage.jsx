import { useEffect, useState } from 'react';
import { Button, Card, Form, Image, InputGroup, Spinner, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import useAxios from '../../hooks/useAxios';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import { formatPrice, getSellingPrice } from '../../utils/format';
import { handleImageError } from '../../utils/image';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import AppPagination from '../../components/common/AppPagination';

const ADMIN_PAGE_SIZE = 10;

/** G3 + H4. Quản trị laptop */
export default function AdminLaptopPage() {
  usePageTitle('Quản trị laptop');
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const { data, loading, error, refetch } = useAxios(
    (signal) =>
      laptopApi.getAll(
        { q: q || undefined, _page: page, _limit: ADMIN_PAGE_SIZE, _sort: 'id', _order: 'desc', _expand: 'brand' },
        signal
      ),
    [q, page]
  );
  const items = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / ADMIN_PAGE_SIZE) : 0;

  // H2. Tìm kiếm có debounce, lưu q lên URL
  const [keyword, setKeyword] = useState(q);
  const debouncedKeyword = useDebounce(keyword.trim(), 500);
  useEffect(() => {
    if (debouncedKeyword === q) return;
    const next = new URLSearchParams();
    if (debouncedKeyword) next.set('q', debouncedKeyword);
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete('page');
    else next.set('page', p);
    setSearchParams(next);
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="fw-bold mb-0">Quản lý laptop</h3>
        <Button as={Link} to="/admin/laptops/new">
          + Thêm laptop
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <InputGroup style={{ maxWidth: 400 }}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Tìm laptop..."
            aria-label="Tìm laptop"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </InputGroup>
        {loading && data && <Spinner size="sm" className="align-self-center" />}
      </div>

      {error && <ErrorAlert message={error} onRetry={refetch} />}
      {loading && !data && <Loading />}

      {data && !error && (
        <Card className="shadow-sm">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Hãng</th>
                  <th className="text-end">Giá bán</th>
                  <th className="text-center">Tồn kho</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((laptop) => (
                  <tr key={laptop.id}>
                    <td>{laptop.id}</td>
                    <td>
                      <Image src={laptop.image} alt="" width={64} rounded className="border" onError={handleImageError} />
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <Link to={`/laptops/${laptop.id}`} className="text-decoration-none">
                        {laptop.name}
                      </Link>
                    </td>
                    <td>{laptop.brand?.name}</td>
                    <td className="text-end text-nowrap">{formatPrice(getSellingPrice(laptop))}</td>
                    <td className="text-center">{laptop.stock}</td>
                    <td className="text-end text-nowrap">
                      <Button as={Link} to={`/admin/laptops/${laptop.id}/edit`} size="sm" variant="outline-primary" className="me-2">
                        Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      <AppPagination page={page} totalPages={totalPages} onChange={goToPage} />
    </>
  );
}
