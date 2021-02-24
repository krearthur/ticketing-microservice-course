import { Publisher, Subjects, TicketUpdatedEvent } from '@krearthur/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated; 
}