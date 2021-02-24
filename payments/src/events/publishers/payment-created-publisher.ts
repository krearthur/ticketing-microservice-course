import { Subjects, Publisher, PaymentCreatedEvent } from '@krearthur/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}