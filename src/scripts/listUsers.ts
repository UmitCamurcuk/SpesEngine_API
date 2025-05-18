import mongoose from 'mongoose';
import connectDB from '../config/database';
import User from '../models/User';

async function listUsers() {
  await connectDB();
  console.log('Veritabanı bağlantısı başarılı. Kullanıcılar listeleniyor...');

  try {
    const users = await User.find({}).select('name email isAdmin isActive lastLogin role');
    console.log('Sistemdeki kullanıcılar:');
    console.log(JSON.stringify(users, null, 2));
    
    // Toplam kullanıcı sayısı
    console.log(`Toplam kullanıcı sayısı: ${users.length}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Kullanıcılar listelenirken bir hata oluştu:', error);
    mongoose.connection.close();
  }
}

listUsers().catch(console.error); 