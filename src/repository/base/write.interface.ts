import mongoose from 'mongoose';

export interface Write<T extends mongoose.Document> {
  create(item: T): Promise<T>;
  update(id: string, item: mongoose.UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<T>;
}
