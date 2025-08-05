import mongoose from 'mongoose';
import Item from '../models/Item';
import ItemType from '../models/ItemType';
import Category from '../models/Category';
import Family from '../models/Family';

/**
 * CUSTOMERS ItemType'ı için test müşterisi oluşturur
 */

async function createTestCustomer() {
  try {

    // 1. CUSTOMERS ItemType'ını bul
    const customersItemType = await ItemType.findOne({ code: 'CUSTOMERS' });
    if (!customersItemType) {
      throw new Error('CUSTOMERS ItemType bulunamadı');
    }

    // 2. Category bul (ilk kategoriyi al)
    const category = await Category.findOne({ isActive: true });
    if (!category) {
      throw new Error('Aktif kategori bulunamadı');
    }
    console.log('📁 Kategori bulundu:', category.code);

    // 3. Family bul (ilk family'yi al)
    const family = await Family.findOne({ isActive: true });
    if (!family) {
      throw new Error('Aktif family bulunamadı');
    }
    console.log('👪 Family bulundu:', family.code);

    // 4. Test müşterisi oluştur
    const testCustomer = await Item.create({
      itemType: customersItemType._id,
      family: family._id,
      category: category._id,
      attributes: {
        // person_information_group'tan gelen attributes
        person_name: 'Ahmet',
        person_lastname: 'Yılmaz',
        person_birthday: '1985-05-15',
        person_sex: 'person_male' // Erkek seçeneği
      },
      associations: {},
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(), // Demo için
      updatedBy: new mongoose.Types.ObjectId()
    });

    console.log('   Ad:', testCustomer.attributes.person_name);
    console.log('   Soyad:', testCustomer.attributes.person_lastname);

    // 5. İkinci test müşterisi de oluştur
    const testCustomer2 = await Item.create({
      itemType: customersItemType._id,
      family: family._id,
      category: category._id,
      attributes: {
        person_name: 'Fatma',
        person_lastname: 'Özdemir',
        person_birthday: '1990-08-20',
        person_sex: 'person_female' // Kadın seçeneği
      },
      associations: {},
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    console.log('   Ad:', testCustomer2.attributes.person_name);
    console.log('   Soyad:', testCustomer2.attributes.person_lastname);

    // 6. Sonuçları doğrula
    const customerCount = await Item.countDocuments({ itemType: customersItemType._id });

    console.log('');
    console.log('1. Frontend\'de Items -> Create sayfasına gidin');
    console.log('2. ORDERS ItemType\'ını seçin');
    console.log('3. İlişkiler adımında bu müşteriler dropdown\'da görünecek');

  } catch (error: any) {
    console.error('❌ Test müşterisi oluşturulurken hata:', error.message);
    throw error;
  }
}

// Script çalıştır
async function main() {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spesengine';
    await mongoose.connect(mongoUri);

    // Test müşterisi oluştur
    await createTestCustomer();

  } catch (error: any) {
    console.error('💥 Script hatası:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Script'i çalıştır
main().catch(console.error);

export default createTestCustomer;