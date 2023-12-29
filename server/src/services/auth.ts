import crypto from "crypto";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { GaxiosResponse } from "gaxios";
import User, { IUser } from "../models/User";
import Token from "../models/Token";
import sendEmail from "../utils/email/sendEmail";
import generateJwtToken from "../utils/generateJwtToken";
import validateRegisterInput from "../validation/register";
import validateLoginInput from "../validation/login";
import validateRequestPasswordResetInput from "../validation/requestPasswordReset";
import validatePasswordResetInput from "../validation/passwordReset";

const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${clientURL}/login`
);

const registerUser = async (
  username: string,
  email: string,
  password: string,
  password2: string
) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput({
    username,
    email,
    password,
    password2,
  });

  // Check validation
  if (!isValid) {
    throw new Error(JSON.stringify(errors));
  }

  // Check if email or username already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    // Determine if it's the email or username that already exists
    if (existingUser.email === email) {
      throw new Error("Email already exists");
    } else {
      throw new Error("Username already exists");
    }
  }

  // Create a new user
  const newUser = new User({
    username,
    email,
    password,
  });

  // Hash password before saving in the database
  const hash = await bcrypt.hash(newUser.password, Number(bcryptSalt));
  newUser.password = hash;

  // Save the new user to the database
  await newUser.save();

  sendEmail(
    newUser.email,
    "Welcome to LunarQuill",
    {
      username: newUser.username,
    },
    "./template/welcome.handlebars"
  );

  return generateJwtToken(email);
};

const loginUser = async (email: string, password: string) => {
  // Form validation
  const { errors, isValid } = validateLoginInput({ email, password });
  // Check validation
  if (!isValid) {
    throw new Error(JSON.stringify(errors));
  }

  // Find user by email
  const user: IUser | null = await User.findOne({ email });

  if (!user) {
    throw new Error("Email not found");
  }

  // Check password
  const isMatch: boolean = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Sign token
    return generateJwtToken(email);
  } else {
    throw new Error("Password incorrect");
  }
};

const loginUserWithGoogle = async (code: string) => {
  const { tokens } = await oAuth2Client.getToken(code); // exchange code for tokens
  oAuth2Client.setCredentials(tokens);
  const userInfoResponse: GaxiosResponse<{ email: string }> =
    await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
  const { email } = userInfoResponse.data;
  const user = await User.findOne({ email });
  // Create user if does not exist
  if (!user) {
    await User.create({ email });

    sendEmail(
      email,
      "Welcome to LunarQuill",
      { username: email.split("@")[0] || "user" },
      "./template/welcome.handlebars"
    );
  }

  return generateJwtToken(email);
};

const requestPasswordReset = async (email: string) => {
  // Form validation
  const { error, isValid } = validateRequestPasswordResetInput({
    email,
  });

  // Check validation
  if (!isValid) {
    throw new Error(error);
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Email does not exist");

  // Check if there's an existing token within the last minute
  const lastToken = await Token.findOne({
    userId: user._id,
    createdAt: { $gte: Date.now() - 60000 }, // Within the last minute
  });

  if (lastToken) {
    const timeRemaining = Math.ceil(
      (lastToken.createdAt.getTime() + 60000 - Date.now()) / 1000
    );
    throw new Error(
      `Please wait ${timeRemaining} seconds before requesting another password reset`
    );
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/password-reset?token=${resetToken}&id=${user._id}`;

  sendEmail(
    user.email,
    "Password Reset Request",
    {
      username: user.username,
      link: link,
    },
    "./template/requestPasswordReset.handlebars"
  );
  return { link };
};

const resetPassword = async (
  userId: string,
  token: string,
  password: string,
  password2: string
) => {
  // Form validation
  const { error, isValid } = validatePasswordResetInput({
    password,
    password2,
  });

  // Check validation
  if (!isValid) {
    throw new Error(error);
  }

  let passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isTokenValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isTokenValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });

  if (user) {
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        username: user.username,
      },
      "./template/resetPassword.handlebars"
    );
  }

  await passwordResetToken.deleteOne();

  return { message: "Password reset was successful" };
};

export {
  registerUser,
  loginUser,
  loginUserWithGoogle,
  requestPasswordReset,
  resetPassword,
};
