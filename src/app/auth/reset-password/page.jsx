import { reset } from '@actions/auth';
import { SetPassword } from '@components/pages';
import { Suspense } from 'react';

const ForgotPassword = () => (
    <Suspense>
        <SetPassword action={ reset } />
    </Suspense>
);

export default ForgotPassword;