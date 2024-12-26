import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";

const sendEmail = async (
  email: string,
  subject: string,
  payload: Record<string, string>,
  templatePath: string,
) => {
  // Validate environment variables
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, FROM_EMAIL } =
    process.env;

  if (
    !EMAIL_HOST ||
    !EMAIL_PORT ||
    !EMAIL_USERNAME ||
    !EMAIL_PASSWORD ||
    !FROM_EMAIL
  ) {
    throw new Error(
      "Missing required environment variables for email configuration.",
    );
  }

  // Validate email and templatePath
  if (!email || !templatePath) {
    throw new Error("Email and template path are required.");
  }

  // Read and compile template
  const absoluteTemplatePath = path.resolve(__dirname, templatePath);
  const templateSource = await fs
    .readFile(absoluteTemplatePath, "utf8")
    .catch((err) => {
      throw new Error(`Failed to read email template: ${err.message}`);
    });
  const compiledTemplate = handlebars.compile(templateSource);

  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  // Send email
  const result = await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html: compiledTemplate(payload),
  });

  return { success: true, messageId: result.messageId };
};

export default sendEmail;
