import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const sendPasswordSetLink = async (to, token) => {
  await send(
    to,
    "Email Verification for ERPT-Unisan",
    `Hello,<br/><br/> Click on this link to verify your email address.<br/><br/><a href='http://localhost:3000/auth/set-password?token=${token}'>Email Verification</a><br/><br/>
      If you didn’t ask to verify your email address, you can ignore this message. <br/><br/>
      Thank you,<br/><br/> 
      The Municipal Treasurer's Office`
  );
};

const sendPasswordResetLink = async (to, token) => {
  await send(
    to,
    "Password Reset for ERPT-Unisan",

    `Hello,<br/><br/> 
      Click on this link to reset your password.<br/><br/>
      <a href='http://localhost:3000/auth/reset-password?token=${token}'>Password Reset</a> <br/><br/>
      If you didn’t ask to reset your password, you can ignore this email. <br/><br/>
      Thank you,<br/><br/> 
      The Municipal Treasurer's Office`
  );
};

export { send, sendPasswordSetLink, sendPasswordResetLink };
