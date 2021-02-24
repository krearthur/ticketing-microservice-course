import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from '@krearthur/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many seconds to process the job:', delay / 1000);
    
    await expirationQueue.add({
      orderId: data.id
    }, {
      delay
    });

    msg.ack();
  }

}