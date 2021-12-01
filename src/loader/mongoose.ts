import mongoose from 'mongoose';
import config from '../config/config';

export async function initDb(): Promise<void> {
  await mongoose.connect(config.mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  const connection = mongoose.connection;

  // Console log when connection has error
  connection.on('error', () => {
    throw new Error(`unable to connect to database: ${config.mongoURI}`);
  });

  // Console log when connection is active
  connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
  });
}
