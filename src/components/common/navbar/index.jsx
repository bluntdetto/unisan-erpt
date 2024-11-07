'use client'

import Image from 'next/image';
import classes from './component.module.css'
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const router = useRouter()

    return (
        <nav className={ classes.navbar }>
            <Image
                src='/ERPT logo 1.png'
                alt='ERPT Unisan Logo'
                width={ 200 }
                height={ 100 }
                className={ classes.navbarLogo }
            />
            <button className={ classes.contactButton } onClick={ () => router.push('/contact') }>
                <Image
                    src='/contact-icon.png'
                    alt='Contact Icon'
                    width={ 100 }
                    height={ 100 }
                    className={ classes.contactIcon }
                />
                Contact
            </button>
        </nav>
    );
};

export { Navbar };