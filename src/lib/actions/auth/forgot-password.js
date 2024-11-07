'use server'

import prisma from '@lib/prisma';
import { redirect } from 'next/navigation';
import { sendPasswordResetLink } from '@utils/email';
import { generatePageToken } from '@utils/token';

const forgot = async (email) => {
    const user = await prisma.user.findFirst({
        where: { OR: [ { email }, { phone: email } ] }
    })

    if (!user) {
        redirect('/auth/forgot-password?error=Invalid email or mobile number');
    }

    const token = generatePageToken(user);

    await sendPasswordResetLink(user.email, token);

    redirect(`/auth/login?success=Password reset link sent to ${ user.email }`);
}

export { forgot };