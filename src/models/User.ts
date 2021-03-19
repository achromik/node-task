import { Document, model, Model, Schema } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
  publicKey?: string;
}

export type User = Omit<UserDocument, keyof Document>;

export const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  publicKey: String,
});

export const UserModel: Model<UserDocument> = model<UserDocument>(
  'User',
  UserSchema
);
