import type { UserWithoutPassword } from "./User";
import type { Channel } from "./Channel";

enum RequestType {
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

export { RequestType };
export type { RequestDto, Request, PopulatedRequest };
