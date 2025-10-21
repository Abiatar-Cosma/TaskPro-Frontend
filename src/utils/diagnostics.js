// src/utils/diagnostics.js
import axiosInstance from 'api/axiosInstance';
import ENDPOINTS from 'api/endpoints';

export async function runDiagnostics() {
  const info = {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    location: window.location.href,
    axiosBaseURL: axiosInstance.defaults.baseURL,
    hasAccessToken: !!localStorage.getItem('accessToken'),
    hasRefreshToken: !!localStorage.getItem('refreshToken'),
  };

  const results = { info, checks: {} };

  // 1) Ping backend root (opțional, dacă îl expui)
  try {
    const r = await fetch(`${axiosInstance.defaults.baseURL}/`);
    results.checks.backendRoot = { ok: r.ok, status: r.status };
  } catch (e) {
    results.checks.backendRoot = { ok: false, error: e?.message };
  }

  // 2) Ping un endpoint existent public (de ex. /api/docs) – opțional
  try {
    const r = await fetch(`${axiosInstance.defaults.baseURL}/api-docs`);
    results.checks.swagger = { ok: r.ok, status: r.status };
  } catch (e) {
    results.checks.swagger = { ok: false, error: e?.message };
  }

  // 3) Dacă ai token, verifică /api/auth/me
  if (localStorage.getItem('accessToken')) {
    try {
      const me = await axiosInstance.get(ENDPOINTS.auth.me);
      results.checks.me = { ok: true, status: 200, user: me.data };
    } catch (e) {
      results.checks.me = {
        ok: false,
        status: e?.response?.status,
        error: e?.response?.data || e?.message,
      };
    }
  } else {
    results.checks.me = { ok: false, reason: 'no accessToken in localStorage' };
  }

  // 4) Test CORS simplu (OPTIONS/GET) – indirect prin fetch
  try {
    const r = await fetch(`${axiosInstance.defaults.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });
    results.checks.corsAuthMe = { ok: r.ok, status: r.status };
  } catch (e) {
    results.checks.corsAuthMe = { ok: false, error: e?.message };
  }

  // Afișează frumos în consolă
  // (în UI folosim și return; în consolă vezi obiectul)
  // eslint-disable-next-line no-console
  console.log('[Diagnostics]', results);
  return results;
}
