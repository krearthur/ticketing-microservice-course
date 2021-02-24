import nats from 'node-nats-streaming';
import { sortAndDeduplicateDiagnostics } from 'typescript';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '2345',
      title: 'concert',
      price: 23
    });
  } catch (err) {
    console.log(err);
  }

});