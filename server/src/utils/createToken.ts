import crypto from "crypto";

const createToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export default createToken;
