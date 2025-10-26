/**
 * User repository interface
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User | null>;
  delete(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}

import { User, NewUser } from '../modules/user/user.dto.js';

export type CreateUserDto = NewUser;
export type UpdateUserDto = Partial<NewUser>;
export { User };