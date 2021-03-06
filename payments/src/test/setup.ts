import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { app } from '../app';

// add additional property 'signin' for typescript compiler
declare global {
  namespace NodeJS {
    interface Global {
      signin(userId?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (userId) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: userId || new mongoose.Types.ObjectId().toHexString(), 
    email: 'test@test.com'
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJson = JSON.stringify(session);

  // Take JSOn and encode as base64
  const base64 = Buffer.from(sessionJson).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};