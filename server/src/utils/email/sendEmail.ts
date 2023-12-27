import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const sendEmail = async (
  email: string,
  subject: string,
  payload: Record<string, string>,
  template: string
) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => ({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    });

    // Send email
    return transporter.sendMail(options(), (error) => {
      if (error) {
        return error;
      } else {
        return {
          success: true,
        };
      }
    });
  } catch (error) {
    return error;
  }
};

export default sendEmail;
