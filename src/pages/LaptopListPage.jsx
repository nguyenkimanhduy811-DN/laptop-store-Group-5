
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LaptopFilter from '../components/laptop/LaptopFilter';
import laptopApi, { PAGE_SIZE, buildLaptopParams } from '../api/laptopApi';
import useAxios from '../hooks/useAxios';

const FILTER_KEYS = [
  'brandId',
  'categoryId',
  'priceMin',
  'priceMax',
  'ramMin',
  'sort',
  'q',
  'page',
];

const DEBOUNCE_DELAY = 400;

export default function LaptopListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ''])
  );

  // Giá trị đang nhập trong ô tìm kiếm
  const [keyword, setKeyword] = useState(filters.q);

  // Đồng bộ ô tìm kiếm khi URL thay đổi, ví dụ Back/Forward
  useEffect(() => {
    setKeyword(filters.q);
  }, [filters.q]);

  // Chờ người dùng ngừng nhập rồi mới cập nhật URL
  useEffect(() => {
    const normalizedKeyword = keyword.trim();

    if (normalizedKeyword === filters.q) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);

      if (normalizedKeyword) {
        next.set('q', normalizedKeyword);
      } else {
        next.delete('q');
      }

      // Tìm kiếm mới bắt đầu từ trang đầu
      next.delete('page');
      setSearchParams(next);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [keyword, filters.q, searchParams, setSearchParams]);

  // Cập nhật các bộ lọc khác trên URL
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    next.delete('page');
    setSearchParams(next);
  };

  const queryString = searchParams.toString();

  const { data, loading, error, refetch } = useAxios(
    (signal) =>
      laptopApi.getAll(
        buildLaptopParams(filters, PAGE_SIZE),
        signal
      ),
    [queryString]
  );

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Number(filters.page) || 1;

  const changePage = (page) => {
    const next = new URLSearchParams(searchParams);

    if (page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(page));
    }

    setSearchParams(next);
  };

  return (
    <div>
      {/* Tìm kiếm theo từ khóa */}
      <div className="mb-3">
        <label htmlFor="laptop-keyword" className="form-label">
          Tìm kiếm laptop
        </label>

        <input
          id="laptop-keyword"
          type="search"
          className="form-control"
          placeholder="Nhập tên laptop, thương hiệu..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <LaptopFilter
        filters={filters}
        onChange={updateParams}
        onReset={() => {
          setKeyword('');
          setSearchParams({});
        }}
      />

      {/* Tùy chọn sắp xếp */}
      <div className="mb-3">
        <label htmlFor="sort" className="form-label">
          Sắp xếp theo
        </label>

        <select
          id="sort"
          className="form-select"
          value={filters.sort || 'newest'}
          onChange={(event) =>
            updateParams({ sort: event.target.value })
          }
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="bestseller">Bán chạy</option>
        </select>
      </div>

      {loading && <p>Đang tải danh sách laptop...</p>}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={refetch}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p>Tổng số laptop: {total}</p>

          <p>
            Trang {currentPage} / {totalPages}
          </p>

          <div className="d-flex gap-2 align-items-center">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
            >
              Trang trước
            </button>

            <button
              type="button"
              disabled={
                currentPage >= totalPages || totalPages === 0
              }
              onClick={() => changePage(currentPage + 1)}
            >
              Trang sau
            </button>
          </div>

          <p className="text-secondary mt-2">
            Số laptop ở trang này: {data?.items?.length ?? 0}
          </p>
        </>
      )}
    </div>
  );
}
