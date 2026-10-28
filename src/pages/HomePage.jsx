
import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import laptopApi from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
import { isCancel } from '../api/axiosClient';

import useAxios from '../hooks/useAxios';
import usePageTitle from '../hooks/usePageTitle';

import LaptopGrid from '../components/laptop/LaptopGrid';
import ErrorAlert from '../components/common/ErrorAlert';

const NEWEST_PARAMS = {
  _sort: 'createdAt',
  _order: 'desc',
  _limit: 8,
};

const BESTSELLER_PARAMS = {
  _sort: 'sold',
  _order: 'desc',
  _limit: 4,
};

const BANNERS = [
  {
    title: 'BỨT PHÁ MỌI GIỚI HẠN',
    subtitle: 'Laptop gaming mạnh mẽ cho mọi trận chiến.',
    button: 'Khám phá laptop gaming',
    categoryId: 2,
    background: 'linear-gradient(120deg, #141e30, #243b55)',
  },
  {
    title: 'MỎNG NHẸ, LINH HOẠT',
    subtitle: 'Đồng hành cùng bạn trong công việc và học tập.',
    button: 'Khám phá laptop mỏng nhẹ',
    categoryId: 4,
    background: 'linear-gradient(120deg, #134e5e, #71b280)',
  },
  {
    title: 'SỨC MẠNH CHO CÔNG VIỆC',
    subtitle: 'Hiệu năng đáng tin cậy cho những tác vụ chuyên nghiệp.',
    button: 'Khám phá laptop workstation',
    categoryId: 3,
    background: 'linear-gradient(120deg, #42275a, #734b6d)',
  },
];

// Đảm bảo dữ liệu danh mục là mảng trước khi hiển thị.
function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

async function loadParallel(signal) {
  const start = performance.now();

  const [newestResult, bestsellerResult, brands, categories] =
    await Promise.all([
      laptopApi.getAll(NEWEST_PARAMS, signal),
      laptopApi.getAll(BESTSELLER_PARAMS, signal),
      catalogApi.getBrands(signal),
      catalogApi.getCategories(signal),
    ]);

  return {
    newestLaptops: ensureArray(newestResult?.items),
    bestsellers: ensureArray(bestsellerResult?.items),
    brands: ensureArray(brands),
    categories: ensureArray(categories),
    parallelMs: Math.round(performance.now() - start),
  };
}

async function loadSequential(signal) {
  const start = performance.now();

  const newestResult = await laptopApi.getAll(NEWEST_PARAMS, signal);
  const bestsellerResult = await laptopApi.getAll(
    BESTSELLER_PARAMS,
    signal,
  );
  const brands = await catalogApi.getBrands(signal);
  const categories = await catalogApi.getCategories(signal);

  return {
    newestLaptops: ensureArray(newestResult?.items),
    bestsellers: ensureArray(bestsellerResult?.items),
    brands: ensureArray(brands),
    categories: ensureArray(categories),
    sequentialMs: Math.round(performance.now() - start),
  };
}

export default function HomePage() {
  usePageTitle('Trang chủ');

  const fetchHomeData = useCallback(
    (signal) => loadParallel(signal),
    [],
  );

  const { data, loading, error, refetch } = useAxios(
    fetchHomeData,
    [],
  );

  const [sequentialMs, setSequentialMs] = useState(null);

  // Đo thời gian tải tuần tự trong môi trường development.
  useEffect(() => {
    if (!import.meta.env.DEV || !data || loading || error) {
      return undefined;
    }

    const controller = new AbortController();

    loadSequential(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSequentialMs(result.sequentialMs);
        }
      })
      .catch((err) => {
        if (!isCancel(err) && !controller.signal.aborted) {
          console.error(
            'Không thể đo thời gian tải tuần tự:',
            err,
          );
        }
      });

    return () => controller.abort();
  }, [data, loading, error]);

  const newestLaptops = ensureArray(data?.newestLaptops);
  const bestsellers = ensureArray(data?.bestsellers);
  const brands = ensureArray(data?.brands);
  const categories = ensureArray(data?.categories);

  return (
    <main className="container py-4">
      {import.meta.env.DEV && data && (
        <div className="mb-3">
          <Badge bg="info" text="dark">
            Tuần tự:{' '}
            {sequentialMs === null
              ? 'Đang đo...'
              : `${sequentialMs} ms`}
            {' | '}
            Song song: {data.parallelMs} ms
          </Badge>
        </div>
      )}

      {error && (
        <ErrorAlert message={error} onRetry={refetch} />
      )}

      {!error && (
        <>
          {/* Banner giới thiệu */}
          <Carousel className="mb-5" interval={5000}>
            {BANNERS.map((banner) => (
              <Carousel.Item key={banner.title}>
                <div
                  className="d-flex flex-column justify-content-center align-items-start text-white p-5"
                  style={{
                    minHeight: '280px',
                    background: banner.background,
                    borderRadius: '12px',
                  }}
                >
                  <h1 className="fw-bold">{banner.title}</h1>

                  <p className="fs-5">{banner.subtitle}</p>

                  <Button
                    as={Link}
                    to={`/laptops?categoryId=${banner.categoryId}`}
                    variant="light"
                  >
                    {banner.button}
                  </Button>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>

          {/* Thương hiệu nổi bật */}
          <section className="mb-5">
            <h2 className="mb-3">Thương hiệu nổi bật</h2>

            <div className="d-flex flex-wrap gap-2">
              {loading
                ? Array.from({ length: 4 }, (_, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      disabled
                    >
                      Đang tải...
                    </Button>
                  ))
                : brands.map((brand) => (
                    <Button
                      key={brand.id}
                      as={Link}
                      to={`/laptops?brandId=${brand.id}`}
                      variant="outline-primary"
                    >
                      {brand.name}
                    </Button>
                  ))}
            </div>
          </section>

          {/* Laptop bán chạy */}
          <section className="mb-5">
            <h2 className="mb-3">Laptop bán chạy</h2>

            <LaptopGrid
              laptops={bestsellers}
              loading={loading}
              skeletonCount={4}
            />
          </section>

          {/* Laptop mới nhất */}
          <section className="mb-5">
            <h2 className="mb-3">Laptop mới nhất</h2>

            <LaptopGrid
              laptops={newestLaptops}
              loading={loading}
              skeletonCount={8}
            />
          </section>

          {/* Danh mục laptop */}
          {!loading && categories.length > 0 && (
            <section className="mb-4">
              <h2 className="mb-3">Danh mục laptop</h2>

              <div className="d-flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    as={Link}
                    to={`/laptops?categoryId=${category.id}`}
                    variant="outline-secondary"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
