import { EmployeeSidebar } from "@components/common";
import { auth } from '@lib/auth';

const Layout = async ({ children }) => {
    const { user } = await auth();

    return (
        <div className='d-flex'>
            <EmployeeSidebar user={ user } />
            <div className='flex-grow-1'>{ children }</div>
        </div>
    );
};

export default Layout;
