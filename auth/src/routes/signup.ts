import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@krearthur/common';

import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20})
    .withMessage('Password must be between 4 and 20 characters'),
],
validateRequest,
async (req: Request, res: Response) => {

  let { email, password } = req.body;
  console.log(`Request for new user with ${email}.`);

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email already in use');
  }
  
  // Create new user
  const user = User.build({ email, password });
  await user.save();
  console.log("Saved new user with hashed password in db.");

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email
    }, 
    process.env.JWT_KEY! // Exclamation mark tells TS that it should not worry about this variable and we have made sure that it is set correctly
  );
  
  // Store it on session object
  req.session = {
    jwt: userJwt
  };
  res.status(201).send(user);

});

export { router as signupRouter }