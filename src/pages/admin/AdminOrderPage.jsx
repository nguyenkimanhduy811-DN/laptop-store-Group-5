import { Badge, Button, ButtonGroup, Card, Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import useAxios from '../../hooks/useAxios';
import usePageTitle from '../../hooks/usePageTitle';
import { formatDateTime, formatPrice } from '../../utils/format';
import { getStatus, ORDER_STATUS } from '../../utils/orderStatus';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

/** G4. Quản lý đơn hàng (admin) */
export default function AdminOrderPage() {
  usePageTitle('Quản lý đơn hàng');
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? ''; // lọc đồng bộ trên URL ?status=

  const { data: orders, loading, error, refetch } = useAxios(
    (signal) => orderApi.getAll(status ? { status } : {}, signal),
    [status]
  );

  return (
    <>
      <h3 className="fw-bold mb-3">Quản lý đơn hàng</h3>

      <ButtonGroup className="mb-3 flex-wrap">
        <Button variant={status === '' ? 'dark' : 'outline-dark'} onClick={() => setSearchParams({})}>
          Tất cả
        </Button>
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <Button
            key={key}
            variant={status === key ? 'dark' : 'outline-dark'}
            onClick={() => setSearchParams({ status: key })}
          >
            {s.label}
          </Button>
        ))}
      </ButtonGroup>

      {loading && <Loading />}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {!loading && !error && (
        <Card className="shadow-sm">
          {orders.length === 0 ? (
            <EmptyState icon="📦" message="Không có đơn hàng nào" />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Sản phẩm</th>
                  <th className="text-end">Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 180 }}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const current = getStatus(order.status);
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div>{order.customer.fullName}</div>
                        <small className="text-secondary">{order.customer.phone}</small>
                      </td>
                      <td className="text-nowrap">{formatDateTime(order.createdAt)}</td>
                      <td style={{ minWidth: 200 }}>
                        {order.items.map((it) => (
                          <div key={it.laptopId} className="small">
                            {it.name} × {it.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="text-end text-nowrap fw-semibold">{formatPrice(order.total)}</td>
                      <td>
                        <Badge bg={current.variant}>{current.label}</Badge>
                      </td>
                      <td />
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </>
  );
}
