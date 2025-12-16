import PublicApi from "../api/PublicApi";

export interface LoginRequest {
  email: string;
  password: string;
  captcha: string;
  remember: boolean | undefined;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await PublicApi.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
