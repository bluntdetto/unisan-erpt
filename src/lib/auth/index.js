import NextAuth from "next-auth";
import { credentials } from "./credentials";
import prisma from "@lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import * as humps from "humps";

export const authOptions = {
    providers: [credentials],
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: {
        error: "/auth/error",
        newUser: "/auth/register",
        signIn: "/auth/login",
    },
    callbacks: {
        jwt: async ({ token, user, account, profile, session }) => ({
            ...token,
            ...user,
            ...account,
            ...profile,
            ...session,
        }),
        session: async ({ session, token }) => {
            const { id, name, phone, role } = humps.camelizeKeys(token);
            const intId = parseInt(id, 10);

            session.user = {
                ...session.user,
                id: intId,
                name,
                phone,
                role,
            };
            return session;
        },
        signIn: async ({ account, profile }) => {
            return true;
        },
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
