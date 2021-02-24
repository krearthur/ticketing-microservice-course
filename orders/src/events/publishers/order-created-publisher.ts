import { Publisher, OrderCreatedEvent, Subjects } from '@krearthur/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}