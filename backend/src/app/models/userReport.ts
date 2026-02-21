/**
 * @file userReport.ts
 * @description
 * Report related models
 *
 * @module models
 * @version 1.0.0
 * @auth Brian
 */

type Topic =
  | "UNDEFINED"
  | "HATE_SPEECH_HARASSMENT_OR_BULLYING"
  | "VIOLENT_THREATS"
  | "SPAM"
  | "INNAPPROPRIATE_CONTENT"
  | "FRAUD_OR_IMPERSONATION"
  | "OTHER";
type Status =
  | "CREATED"
  | "INPROGRESS"
  | "VIEWED"
  | "COMPLETED"
  | "FAILED"
  | "DELETED"
  | "ERROR";

type UserReport = {
  id: number;

  victimUserId: number;
  offenderUserId: number;

  reportTopic: Topic;
  reportDescription?: string | null;

  reportStatus: Status;

  createdAt: Date;
  updatedAt: Date;
};

export type { Topic, Status, UserReport };
