/**
 * User repository interface
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User | undefined>;
  update(id: string, data: UpdateUserDto): Promise<User | null>;
  delete(id: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<User | null>;
  setEmailVerificationCode(id: string, code: string, expiresAt: Date): Promise<User | null>;
  verifyEmailWithCode(email: string, code: string): Promise<User | null>;
  setPasswordResetCode(email: string, code: string, expiresAt: Date): Promise<User | null>;
  verifyPasswordResetCode(email: string, code: string): Promise<User | null>;
  emailExists(email: string): Promise<boolean>;
}

import { User, NewUser } from '../modules/user/user.dto.js';

export type CreateUserDto = NewUser;
export type UpdateUserDto = Partial<NewUser>;
export { User };