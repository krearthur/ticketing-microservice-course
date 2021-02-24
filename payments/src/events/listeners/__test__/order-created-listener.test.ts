import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@krearthur/common';
import mongoose, { mongo } from 'mongoose';
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'asdf',
    userId: 'asdf',
    status: OrderStatus.Created,
    ticket: {
      id: 'asdfölk',
      price: 10
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.id).toEqual(data.id)
  expect(order!.price).toEqual(data.ticket.price)
})
  
it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})
