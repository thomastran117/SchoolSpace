import { Response, Request } from "express";

type TypedRequest<T> = Request<{}, {}, T>;
type TypedResponse<T> = Response<T>;

export { TypedRequest, TypedResponse };
