"use server";

import prisma from "@lib/prisma";
import { auth } from "@lib/auth";

const get = async () => {
    const { user } = (await auth()) || {};

    return prisma.user.findFirst({
        where: { id: user.id },
        include: {
            properties: true
        }
    });
};

export { get };
