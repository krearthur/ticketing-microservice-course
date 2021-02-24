import { VERSION_INCREMENT } from '@krearthur/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';


interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  /** Run query to look at all orders. Find an order where the ticket 
  * is this ticket *and* the orders status is *not* cancelled.
  * If we find an order from that means the ticket *is* reserved
  */
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  /**
   * Searches for a ticket by event data. Since the service uses Optimistic Concurrency Control,
   * we need to provide not only the ticket id but also a version. The provided version
   * can only find a ticket which is exactly one version lower, because the major service
   * for tickets is the ticket service which increments the version first.
   * @param event The ticket event containing the ticket id and version to search for
   */
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
});

ticketSchema.set('versionKey', 'version');
// ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.pre('save', function (done) {
  // @ts-ignore
  this.$where = {
    version: this.get('version') - VERSION_INCREMENT
  };

  done();
});


ticketSchema.statics.findByEvent = (event: { id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
}

// Define new methods for the ticket model
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

// Define new methods for a ticket document instance
ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  // this === the ticket document instance
  const reservedOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  return !!reservedOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };