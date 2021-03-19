import mongoose from 'mongoose';

import { RepositoryBase } from './RepositoryBase';
import { UserDocument, UserModel } from '~models';

export class UserRepository extends RepositoryBase<UserDocument> {
  constructor() {
    super(UserModel);
  }

  updateByEmail(
    email: string,
    item: mongoose.UpdateQuery<UserDocument>
  ): Promise<UserDocument | null> {
    return this._model
      .findOneAndUpdate(
        { email },
        { ...item },
        { returnOriginal: false, rawResult: false }
      )
      .exec();
  }
}
