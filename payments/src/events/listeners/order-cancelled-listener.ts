import { Listener, OrderCancelledEvent, OrderStatus, Subjects, VERSION_INCREMENT } from '@krearthur/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { Queue_Group_Name } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = Queue_Group_Name;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

    const order = await Order.findOne({
      _id: data.id,
      version: data.version - VERSION_INCREMENT
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    
    msg.ack();
  }

}