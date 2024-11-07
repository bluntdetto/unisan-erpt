'use server'

import prisma from '@lib/prisma'
import { hash } from '@utils/hashing';
import { redirect } from 'next/navigation';
import { generatePageToken } from '@utils/token';


const set = async (user, password) => {
    const existingUser = await prisma.user.findFirst({
        where: { id: user.id }
    });

    if (!existingUser) {
        // TODO: update this to show an error message on ui
        redirect(`/auth/set-password?token=${ generatePageToken(user) }error=Invalid token`);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: await hash(password) }
    });


    redirect("/auth/login?success=Your password has been set successfully");
}

export { set };