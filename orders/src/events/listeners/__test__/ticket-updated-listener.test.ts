import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@krearthur/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Rammstein',
    price: 230
  });
  await ticket.save();

  // Create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1, // provide a version one higher than the previous
    title: 'Something you want!',
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, ticket, msg };
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticketFromDb = await Ticket.findById(ticket.id);

  expect(ticket.version).not.toEqual(ticketFromDb!.version);
  expect(ticketFromDb!.price).toEqual(data.price);
  expect(ticketFromDb!.title).toEqual(data.title);
  expect(ticketFromDb!.version).toEqual(data.version);
})

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener } = await setup();

  // increase version to higher then last updated version
  data.version = 10;
  
  try {
    await listener.onMessage(data, msg);
  } catch (err) { }
  
  expect(msg.ack).not.toHaveBeenCalled();

})