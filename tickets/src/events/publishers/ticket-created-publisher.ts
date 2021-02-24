import { Publisher, Subjects, TicketCreatedEvent } from '@krearthur/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated; 
}