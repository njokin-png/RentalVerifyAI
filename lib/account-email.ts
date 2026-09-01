import { AccountTokenType } from "@prisma/client";
import { createAccountToken } from "@/lib/account-tokens";
import { sendEmail } from "@/services/email";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export async function sendVerificationEmail(user: {
  id: string;
  email: string;
}) {
  const token = await createAccountToken(
    user.id,
    AccountTokenType.EMAIL_VERIFICATION,
  );
  const url = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: user.email,
    subject: "Verify your RentalVerifyAI email",
    text: `Verify your RentalVerifyAI email by opening this one-time link within 24 hours:\n\n${url}\n\nIf you did not create this account, you can ignore this message.`,
  });
}

export async function sendPasswordResetEmail(user: {
  id: string;
  email: string;
}) {
  const token = await createAccountToken(user.id, AccountTokenType.PASSWORD_RESET);
  const url = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: user.email,
    subject: "Reset your RentalVerifyAI password",
    text: `Reset your RentalVerifyAI password by opening this one-time link within 1 hour:\n\n${url}\n\nIf you did not request this reset, you can ignore this message.`,
  });
}
