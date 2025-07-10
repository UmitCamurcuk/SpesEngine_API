import mongoose from 'mongoose';
import User from '../models/User';

const updateUsersForTokens = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spesengine');
    console.log('MongoDB\'ye bağlandı');

    // Tüm kullanıcıları güncelle - tokenVersion alanını ekle
    const result = await User.updateMany(
      { tokenVersion: { $exists: false } }, // tokenVersion alanı olmayan kullanıcılar
      { $set: { tokenVersion: 0 } } // tokenVersion'ı 0 olarak set et
    );

    console.log(`${result.modifiedCount} kullanıcı tokenVersion alanıyla güncellendi`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    process.exit(1);
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  updateUsersForTokens();
}

export default updateUsersForTokens; 