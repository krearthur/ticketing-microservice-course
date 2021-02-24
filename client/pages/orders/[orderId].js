import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // The return method is the de-facto deconstructor of this component
    return () => {
      clearInterval(timerId);
    }
  }, []); // empty brackets means call useEffect only on construction of component

  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }

  return <div>Time left to pay: {timeLeft} seconds.
    <StripeCheckout
      token={({id}) => doRequest({ token: id })}
      // todo put token into env variable
      stripeKey="pk_test_51IM6ulJi3xn1IYTqkbrpblExnlSTjAHoDdkqcjQp1h4XYx25TQYZ3I9FD1KhBz7QBS6lj9EedwEbD2BxIokvHgXV00hfsdENXO"
      amount={order.ticket.price * 100}
      email={currentUser.email}
    />
    {errors}
  </div>
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}

export default OrderShow;