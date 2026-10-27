
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCancel } from '../api/axiosClient';

/**
 * H1. Custom hook gom logic loading / data / error / AbortController.
 *
 * - Mỗi lần deps đổi: hủy request cũ rồi gọi request mới.
 * - Bỏ qua lỗi hủy request.
 * - refetch(): gọi lại request.
 * - setData: cập nhật dữ liệu cục bộ.
 */
export default function useAxios(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Luôn dùng phiên bản fetcher mới nhất.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal);

        if (controller.signal.aborted) return;

        setData(result);
      } catch (err) {
        if (isCancel(err) || controller.signal.aborted) return;

        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();

    // Hủy request cũ khi deps đổi hoặc component unmount.
    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  // Gọi lại request khi cần.
  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { data, loading, error, refetch, setData };
}
