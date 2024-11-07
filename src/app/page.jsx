import { Sidebar } from "@components/common";
import { Overview } from "@pages/overview";
import { auth } from '@lib/auth';


const Home = async () => {
    const { user } = await auth();
    return (
        <div className='d-flex'>
            <Sidebar user={ user } />
            <div className='flex-grow-1'>
                <Overview />

            </div>
        </div>
    );
}

export default Home;
