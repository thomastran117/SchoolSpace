export default interface UserPayload {
  id: number;
  email: string;
  role: string;
  exp?: number;
}