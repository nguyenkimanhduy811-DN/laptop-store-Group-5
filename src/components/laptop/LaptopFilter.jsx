
import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const RAM_OPTIONS = [8, 16, 32];

/**
 * E3. Bộ lọc dạng controlled, không tự đọc URL.
 *
 * filters: giá trị bộ lọc hiện tại.
 * onChange: callback nhận phần thay đổi.
 * onReset: callback xóa toàn bộ bộ lọc.
 * idPrefix: giúp tránh trùng ID khi render nhiều bộ lọc.
 */
export default function LaptopFilter({
  brands = [],
  categories = [],
  filters = {},
  onChange,
  onReset,
  idPrefix = 'f',
}) {
  const [priceMin, setPriceMin] = useState(filters.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(filters.priceMax ?? '');

  useEffect(() => {
    setPriceMin(filters.priceMin ?? '');
    setPriceMax(filters.priceMax ?? '');
  }, [filters.priceMin, filters.priceMax]);

  const priceInvalid =
    priceMin !== '' &&
    priceMax !== '' &&
    Number(priceMin) > Number(priceMax);

  const applyPrice = (event) => {
    event.preventDefault();

    if (!priceInvalid) {
      onChange({ priceMin, priceMax });
    }
  };

  return (
    <div className="laptop-filter">
      <h6 className="fw-bold">Hãng</h6>

      <Form.Check
        type="radio"
        id={`${idPrefix}-brand-all`}
        name={`${idPrefix}-brand`}
        label="Tất cả"
        checked={!filters.brandId}
        onChange={() => onChange({ brandId: '' })}
      />

      {brands.map((brand) => (
        <Form.Check
          key={brand.id}
          type="radio"
          id={`${idPrefix}-brand-${brand.id}`}
          name={`${idPrefix}-brand`}
          label={brand.name}
          checked={filters.brandId === String(brand.id)}
          onChange={() => onChange({ brandId: String(brand.id) })}
        />
      ))}

      <hr />

      <h6 className="fw-bold">Loại laptop</h6>

      <Form.Check
        type="radio"
        id={`${idPrefix}-cat-all`}
        name={`${idPrefix}-category`}
        label="Tất cả"
        checked={!filters.categoryId}
        onChange={() => onChange({ categoryId: '' })}
      />

      {categories.map((category) => (
        <Form.Check
          key={category.id}
          type="radio"
          id={`${idPrefix}-cat-${category.id}`}
          name={`${idPrefix}-category`}
          label={category.name}
          checked={filters.categoryId === String(category.id)}
          onChange={() =>
            onChange({ categoryId: String(category.id) })
          }
        />
      ))}

      <hr />

      <h6 className="fw-bold">Khoảng giá (VND)</h6>

      <Form onSubmit={applyPrice}>
        <InputGroup size="sm" className="mb-2">
          <InputGroup.Text>Từ</InputGroup.Text>

          <Form.Control
            type="number"
            min={0}
            step={1000000}
            placeholder="0"
            aria-label="Giá tối thiểu"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            isInvalid={priceInvalid}
          />
        </InputGroup>

        <InputGroup size="sm" className="mb-2" hasValidation>
          <InputGroup.Text>Đến</InputGroup.Text>

          <Form.Control
            type="number"
            min={0}
            step={1000000}
            placeholder="100000000"
            aria-label="Giá tối đa"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            isInvalid={priceInvalid}
          />

          <Form.Control.Feedback type="invalid">
            Giá từ phải nhỏ hơn hoặc bằng giá đến.
          </Form.Control.Feedback>
        </InputGroup>

        <Button
          type="submit"
          size="sm"
          variant="outline-primary"
          className="w-100"
          disabled={priceInvalid}
        >
          Áp dụng
        </Button>
      </Form>

      <hr />

      <h6 className="fw-bold">RAM tối thiểu</h6>

      <Form.Select
        size="sm"
        aria-label="RAM tối thiểu"
        value={filters.ramMin ?? ''}
        onChange={(event) => onChange({ ramMin: event.target.value })}
      >
        <option value="">Không yêu cầu</option>

        {RAM_OPTIONS.map((ram) => (
          <option key={ram} value={ram}>
            Từ {ram}GB
          </option>
        ))}
      </Form.Select>

      <Button
        variant="outline-secondary"
        size="sm"
        className="w-100 mt-4"
        onClick={onReset}
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}
