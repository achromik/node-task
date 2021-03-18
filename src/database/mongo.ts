import mongoose from 'mongoose';

export class MongoDatabase {
  private static _mongoose: mongoose.Mongoose;

  get mongoose(): mongoose.Mongoose {
    return MongoDatabase._mongoose;
  }

  static async connect(uri: string): Promise<void> {
    try {
      this._mongoose = await mongoose.connect(uri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      mongoose.connection.on('error', (err) => console.error(err));
      console.log('✅ Mongo Database connected!');
    } catch (err) {
      console.error('❌ Mongo database not connected!');
    }
  }
}
