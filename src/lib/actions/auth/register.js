"use server";

import prisma from "@lib/prisma";
import { redirect } from "next/navigation";
import { generatePageToken } from "@utils/token";
import { sendPasswordSetLink } from '@utils/email';

const register = async (data) => {
    const user = await prisma.user.findFirst({
        where: { email: data.get("email") }
    });

    if (!user) {

        redirect("/auth/register?error=Email not found. Please try again.");
    }

    if (user.password) {
        redirect('/auth/register?error=Password already set');
    }

    await sendPasswordSetLink(user.email, generatePageToken(user));

    redirect(
        "/auth/login?success=A link to set your password has been sent to your email address."
    );
};

export { register };
