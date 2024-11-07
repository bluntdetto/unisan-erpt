'use client'

import { Navbar } from '@components/common';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            { children }
        </>
    )
}

export default Layout