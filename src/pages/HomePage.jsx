
import { useState } from 'react';
import { Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import laptopApi from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
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

// Commit 1: Tải đồng thời 4 request bằng Promise.all.
async function loadParallel(signal) {
  const [newestResult, bestsellerResult, brands, categories] =
    await Promise.all([
      laptopApi.getAll(NEWEST_PARAMS, signal),
      laptopApi.getAll(BESTSELLER_PARAMS, signal),
      catalogApi.getBrands(signal),
      catalogApi.getCategories(signal),
    ]);

  return {
    newest: Array.isArray(newestResult?.items)
      ? newestResult.items
      : [],
    bestsellers: Array.isArray(bestsellerResult?.items)
      ? bestsellerResult.items
      : [],
    brands: Array.isArray(brands) ? brands : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

const BANNERS = [
  {
    title: 'Laptop Gaming – Chiến mọi tựa game',
    text: 'RTX 40 series, màn hình 240Hz. Giảm đến 10%.',
    to: '/laptops?categoryId=2',
    bg: 'linear-gradient(135deg, #1a1a2e, #e94560)',
  },
  {
    title: 'Mỏng nhẹ – Mang theo mọi nơi',
    text: 'Dưới 1.4kg, pin cả ngày cho sinh viên và dân văn phòng.',
    to: '/laptops?categoryId=4',
    bg: 'linear-gradient(135deg, #0f4c75, #3282b8)',
  },
  {
    title: 'Máy trạm cho dân Đồ họa – Kỹ thuật',
    text: 'RAM đến 64GB, màn hình OLED chuẩn màu.',
    to: '/laptops?categoryId=3',
    bg: 'linear-gradient(135deg, #2d4059, #ea5455)',
  },
];

export default function HomePage() {
  usePageTitle('Trang chủ');

  const { data, loading, error, refetch } = useAxios(
    loadParallel,
    [],
  );

  const brands = Array.isArray(data?.brands) ? data.brands : [];
  const categories = Array.isArray(data?.categories)
    ? data.categories
    : [];
  const bestsellers = Array.isArray(data?.bestsellers)
    ? data.bestsellers
    : [];
  const newest = Array.isArray(data?.newest) ? data.newest : [];

  return (
    <main className="container py-4">
      <Carousel
        className="mb-4 rounded overflow-hidden shadow-sm"
        interval={4000}
      >
        {BANNERS.map((banner) => (
          <Carousel.Item key={banner.title}>
            <div
              className="home-banner d-flex align-items-center"
              style={{
                background: banner.bg,
                minHeight: '320px',
                borderRadius: '8px',
              }}
            >
              <div className="text-white px-4 px-md-5 py-5">
                <h2 className="fw-bold">{banner.title}</h2>
                <p className="lead">{banner.text}</p>
                <Button
                  as={Link}
                  to={banner.to}
                  variant="warning"
                >
                  Xem ngay
                </Button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {error && (
        <ErrorAlert message={error} onRetry={refetch} />
      )}

      {!error && (
        <>
          <section className="mb-4">
            <h5 className="fw-bold mb-3">Mua theo hãng</h5>

            <div className="d-flex flex-wrap gap-2">
              {loading
                ? Array.from({ length: 4 }, (_, index) => (
                    <Button
                      key={index}
                      variant="outline-dark"
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
                      variant="outline-dark"
                    >
                      {brand.name}
                    </Button>
                  ))}

              {!loading &&
                categories.map((category) => (
                  <Button
                    key={`c${category.id}`}
                    as={Link}
                    to={`/laptops?categoryId=${category.id}`}
                    variant="outline-primary"
                  >
                    {category.name}
                  </Button>
                ))}
            </div>
          </section>

          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🔥 Bán chạy</h4>
              <Link to="/laptops?sort=bestseller">
                Xem tất cả →
              </Link>
            </div>

            <LaptopGrid
              laptops={bestsellers}
              loading={loading}
              skeletonCount={4}
            />
          </section>

          <section className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🆕 Mới về</h4>
              <Link to="/laptops">Xem tất cả →</Link>
            </div>

            <LaptopGrid
              laptops={newest}
              loading={loading}
              skeletonCount={8}
            />
          </section>
        </>
      )}
    </main>
  );
}
