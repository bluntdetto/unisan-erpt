import { auth } from '@lib/auth';
import { NextResponse } from 'next/server';

export const middleware = async (req) => {
    const session = await auth()
    const { nextUrl } = req
    const { pathname } = nextUrl

    if (!session)
        return NextResponse.redirect(new URL('/auth/login', nextUrl));

    if (pathname.includes('/admin') && session.user.role !== 'ADMIN')
        return NextResponse.rewrite(new URL('/not-found', nextUrl));


    if (pathname.includes('/employee') && session.user.role === 'USER')
        return NextResponse.rewrite(new URL('/not-found', nextUrl));

    NextResponse.next();
}

export const config = { matcher: '/((?!.*\\.|api|auth).*)' }