import axios from "axios";
import cookieStore from "./cookiesStore";

export const BASE_URL = "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(async (req) => {
  const token = await cookieStore.get("token");
  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default class ApiClient<Req, Res> {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  get = (data: any) => {
    const queryParams = new URLSearchParams(data?.meta?.params).toString();
    return axiosInstance
      .get<Res>(
        `${this.endpoint}${(data.meta?.params && "?" + queryParams) || ""}`,
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw err;
      });
  };

  put = (data?: Req, id?: string): Promise<Res> => {
    return axiosInstance
      .put<Res>(`${this.endpoint}${id ? `/${id}` : ""}`, data)
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  };

  post = (data?: Req, headers?: {}, id?: string): Promise<Res> => {
    return axiosInstance
      .post<Res>(!id ? this.endpoint : `${this.endpoint}/${id}`, data, headers)
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  };

  delete = (data?: Req, id?: string): Promise<Res> => {
    return axiosInstance
      .delete<Res>(`${this.endpoint}${id ? `/${id}` : ""}`, {
        data,
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  };
}
