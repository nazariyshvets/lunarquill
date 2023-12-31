import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { GaxiosResponse } from "gaxios";
import User from "../models/User";
import Token from "../models/Token";
import validateRegisterInput from "../validation/register";
import validateLoginInput from "../validation/login";
import validateRequestPasswordResetInput from "../validation/requestPasswordReset";
import validatePasswordResetInput from "../validation/passwordReset";
import sendEmail from "../utils/email/sendEmail";
import generateJwtToken from "../utils/generateJwtToken";
import createToken from "../utils/createToken";
import hashString from "../utils/hashString";

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

  // Hash password before saving in the database
  const hashedPassword = await hashString(password);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  // Save the new user to DB
  await newUser.save();

  // Send a greeting email
  sendEmail(
    email,
    "Welcome to LunarQuill",
    { username },
    "./templates/welcome.handlebars"
  );

  // Account verification
  const verificationToken = createToken();
  const hashedVerificationToken = await hashString(verificationToken);

  await new Token({
    userId: newUser._id,
    token: hashedVerificationToken,
    createdAt: Date.now(),
  }).save();

  sendEmail(
    email,
    "Account verification",
    {
      username,
      message:
        "To activate your LunarQuill account, please follow the link below.",
      link: `${clientURL}/account-verification?token=${verificationToken}&id=${newUser._id}`,
      linkText: "Activate",
    },
    "./templates/template.handlebars"
  );

  return { success: true };
};

const verifyAccount = async (userId: string, token: string) => {
  const verificationToken = await Token.findOne({ userId });

  if (!verificationToken) {
    throw new Error("Invalid or expired verification token");
  }

  const isTokenValid = await bcrypt.compare(token, verificationToken.token);

  if (!isTokenValid) {
    throw new Error("Invalid or expired verification token");
  }

  const user = await User.findById(userId);

  if (user) {
    user.active = true;
    await user.save();

    sendEmail(
      user.email,
      "Account Is Verified Successfully",
      {
        username: user.username,
        message: "Your account is verified successfully.",
        link: `${clientURL}/login`,
        linkText: "Log In",
      },
      "./templates/template.handlebars"
    );
  }

  await verificationToken.deleteOne();

  return { message: "Account verification was successful" };
};

const loginUser = async (email: string, password: string) => {
  // Form validation
  const { errors, isValid } = validateLoginInput({ email, password });
  // Check validation
  if (!isValid) {
    throw new Error(JSON.stringify(errors));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email not found");
  }

  // Check if the email is verified
  if (!user.active) {
    throw new Error("You need to verify your email");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
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
    await User.create({ email, active: true });

    sendEmail(
      email,
      "Welcome to LunarQuill",
      { username: email.split("@")[0] || "user" },
      "./templates/welcome.handlebars"
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

  const token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  const resetToken = createToken();
  const hash = await hashString(resetToken);

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
      link,
    },
    "./templates/requestPasswordReset.handlebars"
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

  const passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isTokenValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isTokenValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const user = await User.findById(userId);

  if (user) {
    user.password = await hashString(password);
    user.active = true;
    await user.save();

    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        username: user.username,
        message: "Your password has been changed successfully on LunarQuill.",
        link: `${clientURL}/login`,
        linkText: "Log In",
      },
      "./templates/template.handlebars"
    );
  }

  await passwordResetToken.deleteOne();

  return { message: "Password reset was successful" };
};

export {
  registerUser,
  verifyAccount,
  loginUser,
  loginUserWithGoogle,
  requestPasswordReset,
  resetPassword,
};
