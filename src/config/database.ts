import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spesengine');
    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 