import axios from 'axios';

const api = axios.create(
  process.env.NODE_ENV === 'production'
    ? {
        baseURL: 'https://identify-api.deskcode.de/api',
        withCredentials: true,
      }
    : {
        baseURL: 'http://localhost:5000/api',
        withCredentials: true,
      }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log(err);
    if (err.response.status === 401) {
      return Promise.reject({ unauthorized: true, status: 401 });
    } else {
      return Promise.reject({ ...err });
    }
  }
);

export default api;
