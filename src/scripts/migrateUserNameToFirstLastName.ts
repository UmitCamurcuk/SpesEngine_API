import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const migrateUserNameToFirstLastName = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spesengine');
    console.log('MongoDB bağlantısı başarılı');

    // Name alanı olan kullanıcıları bul
    const usersWithName = await User.find({ name: { $exists: true } });
    console.log(`${usersWithName.length} kullanıcı bulundu`);

    for (const user of usersWithName) {
      const userName = (user as any).name;
      if (!userName) {
        console.log(`Kullanıcı ${user.email} için name alanı boş, atlanıyor`);
        continue;
      }
      
      const nameParts = userName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Kullanıcıyı güncelle
      await User.findByIdAndUpdate(user._id, {
        $set: {
          firstName: firstName,
          lastName: lastName
        },
        $unset: {
          name: 1
        }
      });

      console.log(`Kullanıcı güncellendi: ${user.email} -> ${firstName} ${lastName}`);
    }

    console.log('Migration tamamlandı');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
};

migrateUserNameToFirstLastName();
