import type { UserWithoutPassword } from "./User";
import type { Channel } from "./Channel";

type RequestType = "contact" | "invite" | "join";

enum RequestTypeEnum {
  Contact = "contact",
  Invite = "invite",
  Join = "join",
}

interface RequestDto {
  from: string;
  to: string | null;
  type: RequestType;
  channel?: string;
}

interface Request extends RequestDto {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

interface PopulatedRequest extends Omit<Request, "from" | "to" | "channel"> {
  from: UserWithoutPassword;
  to: UserWithoutPassword;
  channel: Channel;
}

export { RequestTypeEnum };
export type { RequestDto, Request, RequestType, PopulatedRequest };
