import axios from 'axios';
import ENDPOINTS from './endpoints';

const baseURL =
  process.env.REACT_APP_API_URL || 'https://task-pro-backend-5kph.onrender.com';
console.log('[axios] baseURL =', baseURL, 'NODE_ENV=', process.env.NODE_ENV);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false, // ⬅️ IMPORTANT: fără cookies cross-site
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (
      (config.method === 'post' || config.method === 'patch') &&
      config.url &&
      config.url.includes('/api/cards')
    ) {
      console.log(`${config.method.toUpperCase()} ${config.url} request:`, {
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  error => Promise.reject(error)
);

/* =========================
   REFRESH MANAGEMENT (queue)
   ========================= */
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = newToken => {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

const addSubscriber = cb => refreshSubscribers.push(cb);

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
axiosInstance.interceptors.response.use(
  response => {
    if (response.config.url && response.config.url.includes('/api/cards')) {
      console.log(`Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('❌ Eroare rețea sau server indisponibil:', error.message);
      return Promise.reject(error);
    }

    if (error.response.status >= 400) {
      let safeData = originalRequest?.data;
      if (typeof safeData === 'string') {
        try {
          safeData = JSON.parse(safeData);
        } catch {}
      }

      console.error(`${error.response.status} Error:`, {
        url: originalRequest?.url,
        method: originalRequest?.method,
        requestData: safeData,
        responseData: error.response.data,
        validationErrors: error.response.data?.errors || [],
        message:
          error.response.data?.message ||
          `Unknown error (${error.response.status})`,
      });

      if (
        error.response.status === 404 &&
        originalRequest?.url?.includes('/api/cards')
      ) {
        console.warn(
          '⚠️ 404 la endpoint-ul de carduri - probabil nu există carduri încă'
        );
      }
    }

    const isUnauthorized =
      error.response.status === 401 &&
      !originalRequest._isRetry &&
      !originalRequest.url?.includes(ENDPOINTS.auth.refreshToken);

    if (!isUnauthorized) {
      return Promise.reject(error);
    }

    // ————— 401: încercăm refresh —————
    if (isRefreshing) {
      return new Promise(resolve => {
        addSubscriber(newToken => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    originalRequest._isRetry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.warn('❌ Refresh token lipsește din localStorage');
        throw new Error('Refresh token lipsește');
      }

      console.log(
        '🔄 Începe refresh token cu:',
        refreshToken.substring(0, 10) + '...'
      );

      const { data } = await axios.post(
        `${baseURL}${ENDPOINTS.auth.refreshToken}`,
        { refreshToken },
        {
          withCredentials: false, // ⬅️ IMPORTANT: fără cookies
          timeout: 10000,
        }
      );

      const newToken = data.token;
      const newRefresh = data.refreshToken;

      if (!newToken) {
        throw new Error('❌ Token nou lipsă în răspuns');
      }

      localStorage.setItem('accessToken', newToken);
      if (newRefresh) {
        localStorage.setItem('refreshToken', newRefresh);
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      onRefreshed(newToken);
      isRefreshing = false;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      console.error('🔁 Token refresh eșuat:', refreshError.message);
      if (refreshError.response) {
        console.error('Detalii răspuns:', refreshError.response.data);
      }
      isRefreshing = false;
      onRefreshFailed(refreshError);

      if (
        refreshError.response &&
        (refreshError.response.status === 401 ||
          refreshError.response.status === 403)
      ) {
        console.warn('🔑 Șterg token-urile din cauza unei erori de autorizare');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        axiosInstance.defaults.headers.common.Authorization = '';
        // opțional: redirect la login
        // window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
