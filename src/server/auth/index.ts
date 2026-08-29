// src/server/auth/index.ts
import NextAuth from "next-auth";

import { authConfig } from "./config";

const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    ...authConfig.session,
    strategy: "jwt",
  },
} as any);

export { auth, handlers, signIn, signOut };
