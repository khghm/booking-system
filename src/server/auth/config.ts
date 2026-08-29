// src/server/auth/config.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { authOptions } from "~/lib/auth";

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.password) {
          return null;
        }

        const bcrypt = await import("bcryptjs");
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }: { session: { user?: { id?: string; role?: string } }; token: { id?: string; role?: string } }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: (token.role as "USER" | "ADMIN") || "USER",
        }
      };
    },
    jwt: ({ token, user }: { token: { id?: string; role?: string }; user?: { id?: string; role?: string } }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: (user.role as "USER" | "ADMIN") || "USER",
        };
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
};
