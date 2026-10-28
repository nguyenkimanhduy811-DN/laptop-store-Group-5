
import { useSearchParams } from 'react-router-dom';
import LaptopFilter from '../components/laptop/LaptopFilter';

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

export default function LaptopListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc bộ lọc từ URL
  const filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ''])
  );

  // Cập nhật bộ lọc trên URL
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    // Thay đổi bộ lọc thì quay về trang đầu
    next.delete('page');

    setSearchParams(next);
  };

  return (
    <div>
      <LaptopFilter
        filters={filters}
        onChange={updateParams}
        onReset={() => setSearchParams({})}
      />
    </div>
  );
}