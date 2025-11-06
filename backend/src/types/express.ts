import type { Response, Request } from "express";

type TypedRequest<
  Body = unknown,
  Params extends Record<string, string> = Record<string, string>,
  Query extends Record<string, unknown> = Record<string, unknown>,
> = Request<Params, unknown, Body, Query>;

type TypedResponse<ResponseBody = unknown> = Response<ResponseBody>;

export { TypedRequest, TypedResponse };
