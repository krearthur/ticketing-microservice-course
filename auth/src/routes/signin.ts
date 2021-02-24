import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@krearthur/common';

import { Password } from '../services/Password';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
  ], 
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Login attempt failed');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password, 
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Login attempt failed')
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      }, 
      process.env.JWT_KEY! // Exclamation mark tells TS that it should not worry about this variable and we have made sure that it is set correctly
    );

    // Store it on session object
    req.session = {
      jwt: userJwt
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter }