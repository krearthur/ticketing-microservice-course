import { Listener, OrderCreatedEvent, Subjects } from '@krearthur/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { Queue_Group_Name } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = Queue_Group_Name;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const newOrder = Order.build({
      id: data.id,
      version: data.version,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
    });

    await newOrder.save();

    msg.ack();
  }

}