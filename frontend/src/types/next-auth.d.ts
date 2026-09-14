import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "UNSET" | "EDUCATOR" | "INSTITUTION";
    } & DefaultSession["user"];
  }

  interface User {
    role: "UNSET" | "EDUCATOR" | "INSTITUTION";
  }
}
