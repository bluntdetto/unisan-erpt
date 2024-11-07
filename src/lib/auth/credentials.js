import Credentials from "next-auth/providers/credentials";
import prisma from "@lib/prisma";
import { compare } from "@utils/hashing";

const options = {
    credentials: {
        email: {},
        password: {}
    },
    authorize: async (credentials) => {
        const { email, password } = credentials;

        if (!email || !password) throw new Error("Missing credentials");

        const user = await prisma.user.findFirst({
            where: {
                OR: [ { email }, { phone: email } ]
            }
        });

        if (!user) throw new Error("Invalid credentials");

        const valid = await compare(password, user.password);

        if (!valid) throw new Error("Invalid credentials");

        return user;
    }
};

export const credentials = Credentials(options);
