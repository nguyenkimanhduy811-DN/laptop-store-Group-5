
import { useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCancel } from '../api/axiosClient';

/**
 * H1. Gom logic loading / data / error / AbortController.
 *
 * Mỗi lần deps thay đổi:
 * - Hủy request cũ.
 * - Gửi request mới.
 * - Bỏ qua lỗi do request bị hủy.
 */
export default function useAxios(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Luôn sử dụng phiên bản fetcher mới nhất.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal);

        // Không cập nhật dữ liệu nếu request đã bị hủy.
        if (controller.signal.aborted) return;

        setData(result);
      } catch (err) {
        // Không hiển thị lỗi khi request bị hủy.
        if (isCancel(err) || controller.signal.aborted) return;

        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();

    // Hủy request khi deps thay đổi hoặc component bị unmount.
    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
