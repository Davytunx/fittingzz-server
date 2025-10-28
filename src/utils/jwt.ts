import logger from '../config/logger.js';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

export const jwtToken = {
  sign: (payload: object, customOptions?: SignOptions): string => {
    try {
      const options: SignOptions = { 
        expiresIn: customOptions?.expiresIn || config.jwt.expiresIn 
      };
      const token = jwt.sign(payload, config.jwt.secret, options);
      if (typeof token !== 'string') {
        throw new Error('Expected JWT to be a string');
      }
      return token;
    } catch (error) {
      logger.error('Failed to sign token:', error);
      throw new Error('Failed to sign token');
    }
  },
  
  verify: (token: string) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.error('Failed to authenticate token:', error);
      throw new Error('Failed to authenticate token');
    }
  },
};