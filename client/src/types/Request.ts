type RequestType = "contact" | "invite" | "join";

enum RequestTypeEnum {
  Contact = "contact",
  Invite = "invite",
  Join = "join",
}

interface Request {
  from: string;
  to: string | null;
  type: RequestType;
  channel?: string;
}

export default Request;
export { RequestTypeEnum };
export type { RequestType };
