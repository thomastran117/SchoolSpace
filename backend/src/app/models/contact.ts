/**
 * @file contact.ts
 * @description
 * Contact related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
type Status =
  | "CREATED"
  | "INPROGRESS"
  | "VIEWED"
  | "COMPLETED"
  | "FAILED"
  | "DELETED"
  | "ERROR";

type ContactRequest = {
  id: number;
  email: string;
  topic: string;
  status: Status;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

export type { Status, ContactRequest };
