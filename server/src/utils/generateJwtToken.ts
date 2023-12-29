import jwt from "jsonwebtoken";

const generateJwtToken = async (email: string) =>
  jwt.sign({ email }, process.env.JWT_SECRET!, {
    expiresIn: 31556926, // 1 year in seconds
  });

export default generateJwtToken;
