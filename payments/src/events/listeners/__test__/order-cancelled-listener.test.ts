import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus, VERSION_INCREMENT } from '@krearthur/common';
import mongoose from 'mongoose';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 34,
    status: OrderStatus.Created,
    userId: 'lsdkjf',
    version: 0
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + VERSION_INCREMENT,
    ticket: {
      id: '2345'
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, data, msg }
}

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})