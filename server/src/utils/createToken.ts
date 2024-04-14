import crypto from "crypto";

const createToken = () => crypto.randomBytes(32).toString("hex");

export default createToken;
