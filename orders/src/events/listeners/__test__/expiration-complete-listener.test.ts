import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { ExpirationCompleteEvent, OrderCancelledEvent } from '@krearthur/common';

const setup = async () => {
  // object under test
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Expiring Ticket',
    price: 99
  });
  await ticket.save();

  const order = await Order.build({
    ticket,
    expiresAt: new Date(),
    status: OrderStatus.Created,
    userId: 'asdfölkj-34'
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, order, data, msg };
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const mockedPublishCall = (natsWrapper.client.publish as jest.Mock).mock;
  expect(mockedPublishCall.calls.length).toEqual(1);

  const publishEventData = JSON.parse(
    mockedPublishCall.calls[0][1]
  ) as OrderCancelledEvent['data'];

  expect(publishEventData.id).toEqual(order.id);
})

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})