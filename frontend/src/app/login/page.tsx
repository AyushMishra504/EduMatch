import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = typeof params.error === "string" ? params.error : undefined;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <AuthScreen
      initialMode="login"
      sentEmail={sent ? email : undefined}
      errorKind={
        sent
          ? "sent"
          : error === "email"
            ? "email"
            : error === "send"
              ? "send"
              : undefined
      }
    />
  );
}
