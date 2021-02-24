import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const SignOut = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    onSuccess: () => Router.push('/')
  });

  // On Init and On Exit events
  useEffect(() => {
    doRequest();
  }, []); // providing an empty array means only on Init is called

  return <div>Signing you out...</div>
};

export default SignOut;