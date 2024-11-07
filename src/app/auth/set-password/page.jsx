import { set } from '@actions/auth';
import { SetPassword as Page } from '@components/pages';
import { Suspense } from 'react';

const SetPassword = () => (
    <Suspense>
        <Page action={ set } />
    </Suspense>
);

export default SetPassword;