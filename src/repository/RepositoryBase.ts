import mongoose from 'mongoose';

import { Read } from './base/read.interface';
import { Write } from './base/write.interface';

export abstract class RepositoryBase<T extends mongoose.Document>
  implements Read<T>, Write<T> {
  protected _model: mongoose.Model<T>;

  constructor(schemaModel: mongoose.Model<T>) {
    this._model = schemaModel;
  }

  create(item: T): Promise<T> {
    return this._model.create(item);
  }

  update(id: string, item: mongoose.UpdateQuery<T>): Promise<T | null> {
    return this._model
      .findByIdAndUpdate(
        id,
        { ...item },
        { returnOriginal: false, rawResult: false }
      )
      .exec();
  }

  delete(_id: string): Promise<T> {
    throw new Error('Not implemented');
  }

  findById(id: string): Promise<T | null> {
    return this._model.findById(id).exec();
  }

  findOne(filters: mongoose.FilterQuery<T>): Promise<T | null> {
    return this._model.findOne(filters).exec();
  }
}
