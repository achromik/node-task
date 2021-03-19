import mongoose from 'mongoose';

export interface Read<T> {
  findById(id: string): Promise<T | null>;
  findOne(filters: mongoose.FilterQuery<T>): Promise<T | null>;
}
