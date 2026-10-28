import { useState } from 'react';
import { Alert, Breadcrumb, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import catalogApi from '../../api/catalogApi';
import { getErrorMessage } from '../../api/axiosClient';
import useAxios from '../../hooks/useAxios';
import usePageTitle from '../../hooks/usePageTitle';
import LaptopForm, { EMPTY_LAPTOP } from '../../components/laptop/LaptopForm';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';

/**
 * F4. Trang thêm laptop mới:
 *   /admin/laptops/new → POST
 */
export default function AdminLaptopFormPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Tải song song: hãng, loại
  const { data, loading, error, refetch } = useAxios(
    async (signal) => {
      const [brands, categories] = await Promise.all([
        catalogApi.getBrands(signal),
        catalogApi.getCategories(signal),
      ]);
      return { brands, categories };
    },
    []
  );

  usePageTitle('Thêm laptop');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await laptopApi.create({
        ...payload,
        sold: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
      });
      // F5. Trang đích (AdminLayout → useFlashMessage) hiện Toast
      navigate('/admin/laptops', { state: { message: `Đã lưu "${saved.name}"` } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/laptops' }}>
          Quản lý laptop
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Thêm mới</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="fw-bold mb-3">Thêm laptop mới</h3>
      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <LaptopForm
            initialValues={EMPTY_LAPTOP}
            brands={data.brands}
            categories={data.categories}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitText="Thêm laptop (POST)"
          />
        </Card.Body>
      </Card>
    </>
  );
}
