
import axiosClient from './axiosClient';

/**
 * Đăng nhập giả lập bằng json-server.
 * Tìm user theo email và password, sau đó tạo token giả.
 */
const authApi = {
  async login(email, password) {
    const res = await axiosClient.get('/users', {
      params: { email, password },
    });

    if (res.data.length === 0) {
      throw {
        status: null,
        message: 'Sai email hoặc mật khẩu',
      };
    }

    // Không lưu password vào localStorage.
    const user = { ...res.data[0] };
delete user.password;

    const token = btoa(`${user.id}:${Date.now()}`);

    return { token, user };
  },
};

export default authApi;
