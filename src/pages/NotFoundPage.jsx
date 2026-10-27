
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Không tìm thấy trang');

  return (
    <Container className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <h2>Không tìm thấy trang</h2>
      <p className="text-secondary">
        Địa chỉ bạn truy cập không tồn tại hoặc đã được thay đổi.
      </p>
      <Button as={Link} to="/" variant="primary">
        Về trang chủ
      </Button>
    </Container>
  );
}
