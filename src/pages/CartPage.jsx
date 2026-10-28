import { useState } from 'react';
import { Alert, Button, Card, Image, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import usePageTitle from '../hooks/usePageTitle';
import { formatPrice, getSellingPrice } from '../utils/format';
import { handleImageError } from '../utils/image';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

/** G1. Trang giỏ hàng – dữ liệu lưu thật trong /cartItems */
export default function CartPage() {
  usePageTitle('Giỏ hàng');
  const { items, totalPrice, loading, error, reload } = useCart();

  if (loading && items.length === 0) return <Loading text="Đang tải giỏ hàng..." />;
  if (error) return <ErrorAlert message={error} onRetry={reload} />;

  if (items.length === 0) {
    return (
      <EmptyState icon="🛒" message="Giỏ hàng của bạn đang trống">
        <Button as={Link} to="/laptops">
          Tiếp tục mua sắm
        </Button>
      </EmptyState>
    );
  }

  // Tồn kho đã giảm sau khi thêm vào giỏ (người khác mua) → chặn đặt hàng
  const invalidItems = items.filter((item) => item.quantity > item.laptop.stock);

  return (
    <>
      <h3 className="fw-bold mb-3">Giỏ hàng</h3>

      {invalidItems.length > 0 && (
        <Alert variant="warning">
          {invalidItems.map((item) => (
            <div key={item.id}>
              "{item.laptop.name}" chỉ còn {item.laptop.stock} sản phẩm, vui lòng giảm số lượng.
            </div>
          ))}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Sản phẩm</th>
              <th className="text-end">Đơn giá</th>
              <th className="text-center">Số lượng</th>
              <th className="text-end">Thành tiền</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const price = getSellingPrice(item.laptop); // BR-03
              return (
                <tr key={item.id}>
                  <td style={{ minWidth: 240 }}>
                    <div className="d-flex align-items-center gap-2">
                      <Image src={item.laptop.image} alt="" width={72} rounded className="border" onError={handleImageError} />
                      <Link to={`/laptops/${item.laptopId}`} className="text-decoration-none">
                        {item.laptop.name}
                      </Link>
                    </div>
                  </td>
                  <td className="text-end text-nowrap">{formatPrice(price)}</td>
                  <td className="text-center">
                    <span className="px-3">{item.quantity}</span>
                  </td>
                  <td className="text-end fw-semibold text-nowrap">{formatPrice(price * item.quantity)}</td>
                  <td />
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Card.Footer className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white">
          <Button as={Link} to="/laptops" variant="link">
            ← Tiếp tục mua sắm
          </Button>
          <div className="d-flex align-items-center gap-3">
            <span>
              Tổng cộng: <strong className="fs-4 text-danger">{formatPrice(totalPrice)}</strong>
            </span>
            <Button size="lg" disabled={invalidItems.length > 0}>
              Tiến hành đặt hàng
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
}
