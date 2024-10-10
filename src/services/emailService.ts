import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services like Outlook or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Add this in your .env file
    pass: process.env.EMAIL_PASS, // Add this in your .env file
  },
});

// Function to send confirmation email
export const sendConfirmationEmail = async (email: string, token: string) => {
  const confirmationUrl = `http://localhost:3000/confirm-email?token=${token}`; // Adjust to your front-end domain

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm your email address',
    html: `
      <h1>Email Confirmation</h1>
      <p>Thank you for registering! Please confirm your email by clicking the link below:</p>
      <a href="${confirmationUrl}">Confirm Email</a>
    `,
  };

  // Logging mail options for debugging
  console.log("Sending email to:", email);
  console.log("Confirmation URL:", confirmationUrl);
  
  try {
    // Send email and log success
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
  } catch (error) {
    // Log the error if email fails to send
    console.error("Error sending email:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`; // Replace with your frontend URL

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">Reset Password</a>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  try {
    // Reuse the same transporter object
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};
