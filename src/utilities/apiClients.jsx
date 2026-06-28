import Cookies from "js-cookie";
import axios from "axios";

const TIMEOUT = 1 * 60 * 1000; // 1 minute timeout

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: apiBaseUrl || "",
  timeout: TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flags to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor → attach token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → auto refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.warn("No refresh token. Redirecting to login.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${apiBaseUrl || ""}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = res.data.access;

        localStorage.setItem("auth_token", newAccessToken);
        Cookies.set("auth_token", newAccessToken, {
          expires: 2,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        Cookies.remove("auth_token");

        console.warn("Refresh token invalid or expired.");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
