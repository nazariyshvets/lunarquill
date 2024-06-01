import { jwtDecode } from "jwt-decode";

import type DecodedUserToken from "../types/DecodedUserToken";

const decodeUserToken = (token: string) => {
  const decodedUserToken = jwtDecode<DecodedUserToken>(token);

  return { userId: decodedUserToken.id, username: decodedUserToken.username };
};

export default decodeUserToken;
