type Status = "CREATED" | "INPROGRESS" | "VIEWED" | "COMPLETED" | "FAILED" | "DELETED" | "ERROR" ;

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