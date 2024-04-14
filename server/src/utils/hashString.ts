import bcrypt from "bcrypt";

const bcryptSalt = process.env.BCRYPT_SALT;

const hashString = async (str: string) =>
  await bcrypt.hash(str, Number(bcryptSalt));

export default hashString;
