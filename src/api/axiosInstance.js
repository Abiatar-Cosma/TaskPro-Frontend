import axios from 'axios';
import ENDPOINTS from './endpoints';

const baseURL =
  process.env.REACT_APP_API_URL || 'https://task-pro-backend-5kph.onrender.com';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
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

    // Logging detaliat pentru cereri de carduri (debug util)
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
    // Log răspunsuri de la carduri (debug)
    if (response.config.url && response.config.url.includes('/api/cards')) {
      console.log(`Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Fără răspuns (rețea/server căzut)
    if (!error.response) {
      console.error('❌ Eroare rețea sau server indisponibil:', error.message);
      return Promise.reject(error);
    }

    // Logging de eroare safe (nu mai dăm JSON.parse necontrolat)
    if (error.response.status >= 400) {
      let safeData = originalRequest?.data;
      if (typeof safeData === 'string') {
        try {
          safeData = JSON.parse(safeData);
        } catch {
          // lăsăm stringul brut dacă nu e JSON
        }
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

      // 404 pe carduri = situație normală când nu există carduri
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
      // punem requestul în așteptare până se termină refreshul curent
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
          withCredentials: true,
          timeout: 10000,
        }
      );

      const newToken = data.token;
      const newRefresh = data.refreshToken; // ⬅️ poate fi rotit de backend

      if (!newToken) {
        throw new Error('❌ Token nou lipsă în răspuns');
      }

      // ⬇️ Salvăm NOUL access token
      localStorage.setItem('accessToken', newToken);

      // ⬇️ IMPORTANT: dacă vine refreshToken nou, îl salvăm
      if (newRefresh) {
        localStorage.setItem('refreshToken', newRefresh);
      }

      // Actualizăm header-ele
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      // Reluăm request-urile blocate
      onRefreshed(newToken);
      isRefreshing = false;

      // Relansăm requestul original
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      console.error('🔁 Token refresh eșuat:', refreshError.message);
      if (refreshError.response) {
        console.error('Detalii răspuns:', refreshError.response.data);
      }
      isRefreshing = false;
      onRefreshFailed(refreshError);

      // Curățăm doar la erori de autorizare
      if (
        refreshError.response &&
        (refreshError.response.status === 401 ||
          refreshError.response.status === 403)
      ) {
        console.warn('🔑 Șterg token-urile din cauza unei erori de autorizare');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        axiosInstance.defaults.headers.common.Authorization = '';
        // opțional: redirect la login aici
        // window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
