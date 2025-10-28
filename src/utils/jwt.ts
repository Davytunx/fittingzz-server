import logger from '../config/logger.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const jwtToken = {
  sign: (payload: object): string => {
    try {
      const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
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