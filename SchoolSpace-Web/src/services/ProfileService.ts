import ProtectedApi from "@api/ProtectedApi";

export interface GetUsersQuery {
  role: string;
  page: string | undefined;
  limit: string | undefined;
}

export interface UpdateUserPayload {
  role: string;
}

export interface UpdateAvatarPayload {
  form: string;
}

export type ApiEnvelope<T> = {
  message: string;
  data: T;
};

export interface User {
  id: number;
  email: string;
  role: string;

  username: string | null;
  name: string | null;
  avatar: string | null;

  phone: string | null;
  address: string | null;

  faculty: string | null;
  school: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export async function getUsers() {
  const res = await ProtectedApi.get<ApiEnvelope<User[]>>("/users");
  return res.data.data;
}

export async function getUserById(id: number) {
  const res = await ProtectedApi.get<ApiEnvelope<User>>(`/users/${id}`);
  return res.data.data;
}

export async function updateUser() {}

export async function updateAvatar() {}
