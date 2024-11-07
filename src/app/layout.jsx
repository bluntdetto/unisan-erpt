import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


import './globals.css';
import { BootstrapClient } from '@components/bootstrap-client';

export const metadata = {
    title: 'eRPT - Unisan',
    description: ''
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
        <body>
        <div className='d-flex'>
            <div className='flex-grow-1'>{ children }</div>
        </div>
        <BootstrapClient />
        </body>
        </html>
    );
}
