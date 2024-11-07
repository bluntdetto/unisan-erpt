"use server";

import { signIn } from "@lib/auth";
import { redirect } from 'next/navigation';
import prisma from '@lib/prisma';
import { Role } from '@prisma/client';

const login = async (data) => {
    try {
        await signIn("credentials", {
            email: data.get("email"),
            password: data.get("password"),
            redirect: false
        });
    } catch (error) {
        redirect("/auth/login?error=Invalid email or password. Please try again");
        return
    }

    const user = await prisma.user.findUnique({
        where: { email: data.get("email") || '' }
    });

    switch (user.role) {
        case Role.ADMIN:
            redirect("/admin/arptc");
            break;
        case Role.EMPLOYEE:
            redirect("/employee/arptc");
            break;
        default:
            redirect("/");
    }
};

export { login };
