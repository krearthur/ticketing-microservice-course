import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('Starting expiration service...');
  // make sure our env's are defined
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined!');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined!');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined!');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); // process will be interupted event
    process.on('SIGTERM', () => natsWrapper.client.close()); // process will be terminated event

    new OrderCreatedListener(natsWrapper.client).listen();
    console.log('Now listening for order created events..');

  } catch(err) {
    console.log(err);
  }
}

start();