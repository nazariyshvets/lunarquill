import { JwtPayload } from "jwt-decode";

interface DecodedUserToken extends JwtPayload {
  id: string;
  email: string;
  username?: string;
}

export default DecodedUserToken;
