import mongoose from 'mongoose';
import 'dotenv/config';

const dbConnection = mongoose.createConnection(process.env.DB_CONNECTION_STRING);

dbConnection.on('connected', () => console.log('connected'));

dbConnection.on('close', () => console.log('close'));

dbConnection.on('error', (err) => console.log('error', err));

export { dbConnection };