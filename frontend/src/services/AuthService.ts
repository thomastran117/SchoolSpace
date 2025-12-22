import PublicApi from "../api/PublicApi";

export interface LoginRequest {
  email: string;
  password: string;
  captcha: string;
  remember: boolean | undefined;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: "student" | "teacher";
  captcha: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
  captcha: string;
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

export async function signup(payload: SignupRequest): Promise<LoginResponse> {
  const response = await PublicApi.post<LoginResponse>("/auth/signup", payload);
  return response.data;
}

export async function verify(payload: VerifyRequest): Promise<LoginResponse> {
  const response = await PublicApi.post<LoginResponse>("/auth/verify", payload);
  return response.data;
}
