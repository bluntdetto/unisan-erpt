'use server'

import prisma from '@lib/prisma'
import { hash } from '@utils/hashing';
import { redirect } from 'next/navigation';
import { generatePageToken } from '@utils/token';
import { send } from '@utils/email';


const reset = async (user, password) => {
    const existingUser = await prisma.user.findFirst({
        where: { id: user.id }
    });

    if (!existingUser) {

        redirect(`/auth/set-password?token=${ generatePageToken(user) }error=Invalid or expired token. Please try again.`);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: await hash(password) }
    });

    await send(user.email, 'Password Reset Success', 'Your password has been reset successfully');


    redirect("/auth/login?success=Your password has been reset successfully");
}

export { reset };