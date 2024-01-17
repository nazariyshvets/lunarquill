import jwt from "jsonwebtoken";

const generateJwtToken = async (id: string, email: string, username?: string) =>
  jwt.sign({ id, email, username }, process.env.JWT_SECRET!, {
    expiresIn: 31556926, // 1 year in seconds
  });

export default generateJwtToken;
